use std::{io::Write, sync::Arc};

use bip39::Mnemonic;
use ldk_node::bitcoin::Network;
use serde::{Deserialize, Serialize};

use crate::{
    lightning::{self, NodeConf},
    paths::UserPaths,
};

// home_dir/.bits-wallet/wallets/
// home_dir/.bits-wallet/wallets/wallet_name/seed
// home_dir/.bits-wallet/wallets/wallet_name/config.json
// home_dir/.bits-wallet/wallets/wallet_name/ldk-data/

pub struct Wallet;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WalletConfig {
    wallet_name: String,
    listening_address: String,
    esplora_address: String,
}

impl WalletConfig {
    pub fn new(wallet_name: &str) -> anyhow::Result<Self> {
        let config_file = UserPaths::new().config_file(wallet_name);
        let config_file = match std::fs::read(config_file) {
            Ok(s) => s,
            Err(e) => {
                return Err(anyhow::anyhow!(
                    "Failed to read config file for wallet {}: {}",
                    wallet_name,
                    e
                ))
            }
        };
        let config: WalletConfig = match serde_json::from_slice(&config_file) {
            Ok(c) => c,
            Err(e) => {
                return Err(anyhow::anyhow!(
                    "Failed to parse config file for wallet {}: {}",
                    wallet_name,
                    e
                ))
            }
        };
        Ok(config)
    }
    pub fn update(&mut self, listening_address: String, esplora_address: String) -> bool {
        self.listening_address = listening_address;
        self.esplora_address = esplora_address;
        self.write()
    }
    fn write(&self) -> bool {
        let config_file = UserPaths::new().config_file(&self.wallet_name);
        let mut config_file = match std::fs::File::create(config_file) {
            Ok(file) => file,
            Err(_) => return false,
        };
        let pretty_json = match serde_json::to_string_pretty(&self) {
            Ok(s) => s,
            Err(_) => return false,
        };
        match config_file.write_all(pretty_json.as_bytes()) {
            Ok(_) => {}
            Err(_) => return false,
        };
        match config_file.sync_all() {
            Ok(_) => true,
            Err(_) => false,
        }
    }
    // set listening address
    fn listening_address(&mut self, listening_address: String) {
        self.listening_address = listening_address;
    }
    // set esplora address
    fn esplora_address(&mut self, esplora_address: String) {
        self.esplora_address = esplora_address;
    }
    // get listening address
    pub fn get_listening_address(&self) -> String {
        self.listening_address.clone()
    }
    // get esplora address
    pub fn get_esplora_address(&self) -> String {
        self.esplora_address.clone()
    }
}

impl Wallet {
    pub fn new(
        network: Network,
        wallet_name: String,
        listening_address: String,
        esplora_address: String,
    ) -> anyhow::Result<Mnemonic> {
        let mnemonic = Mnemonic::generate(12).unwrap();
        let seed = mnemonic.to_seed_normalized("");
        let project_base_dir = UserPaths::new().project_base_dir();
        let wallet_dir = UserPaths::new().wallet_dir(&wallet_name);
        let seed_file = UserPaths::new().seed_file(&wallet_name);
        std::fs::create_dir_all(&project_base_dir).unwrap();
        std::fs::create_dir_all(&wallet_dir).unwrap();
        let mut seed_file = std::fs::File::create(seed_file).unwrap();
        seed_file.write_all(&seed).unwrap();
        seed_file.sync_all().unwrap();
        let config = WalletConfig::new(&wallet_name)?;
        config.write();

        let ldk_data_dir = format!("{}/ldk-data", wallet_dir);
        std::fs::create_dir_all(&ldk_data_dir).unwrap();
        let node_conf = Arc::new(NodeConf {
            network,
            storage_dir: ldk_data_dir,
            listening_address,
            seed: seed.to_vec(),
            esplora_address,
        });
        if lightning::init_lazy(node_conf.clone()).0 {
            dbg!("Lightning node initialized");
        } else {
            dbg!("Lightning node failed to initialize");
        }
        Ok(mnemonic)
    }

    fn list_wallets() -> Vec<String> {
        let wallets_dir = UserPaths::new().wallets_dir();
        let mut wallets = Vec::new();
        for entry in std::fs::read_dir(wallets_dir).unwrap() {
            let entry = entry.unwrap();
            let path = entry.path();
            if path.is_dir() {
                let wallet_name = path.file_name().unwrap().to_str().unwrap().to_string();
                wallets.push(wallet_name);
            }
        }
        wallets
    }
    fn update_config(
        wallet_name: String,
        esplora_address: String,
        listening_address: String,
    ) -> bool {
        match WalletConfig::new(&wallet_name) {
            Ok(mut config) => config.update(listening_address, esplora_address),
            Err(_) => false,
        }
    }
}

#[tauri::command]
pub fn create_wallet(
    wallet_name: String,
    listening_address: String,
    esplora_address: String,
) -> Result<String, ()> {
    let mnemonic = match Wallet::new(
        Network::Testnet,
        wallet_name,
        listening_address,
        esplora_address,
    ) {
        Ok(mnemonic) => mnemonic,
        Err(_) => return Err(()),
    };
    Ok(mnemonic.to_string())
}

#[tauri::command]
pub fn update_config(
    wallet_name: String,
    listening_address: String,
    esplora_address: String,
) -> bool {
    Wallet::update_config(wallet_name, esplora_address, listening_address)
}

#[tauri::command]
pub fn list_wallets() -> Vec<String> {
    Wallet::list_wallets()
}

#![allow(dead_code)]
use bdk::bitcoin::psbt::PartiallySignedTransaction;
use bdk::bitcoin::{Address, Amount};
// use bdk::bitcoincore_rpc::RpcApi;
use bdk::blockchain::Blockchain;
use bdk::blockchain::{rpc::Auth, ConfigurableBlockchain, RpcBlockchain, RpcConfig};
use bdk::wallet::{AddressIndex, AddressInfo};
use bdk::{
    bitcoin::{bip32::ExtendedPrivKey, secp256k1::Secp256k1, Network},
    database::SqliteDatabase,
    template::Bip84,
};
use bdk::{SignOptions, TransactionDetails};
use bip39::Mnemonic;

const WALLET_KEYS_SEED_LEN: usize = 64;

pub struct BitcoinWallet {
    wallet: bdk::Wallet<SqliteDatabase>,
    blockchain: RpcBlockchain,
}

impl BitcoinWallet {
    pub fn new(network: Network) -> (Self, Mnemonic) {
        let mnemonic = Self::generate_mnemonic().unwrap();
        let wallet = Self::internal_new(network, &mnemonic.to_seed(""), "/tmp/ldk-desktop");
        (wallet, mnemonic)
    }
    pub fn load(keys_seed_path: &str) -> Self {
        let seed = std::fs::read(keys_seed_path).unwrap();
        let mut key = [0; WALLET_KEYS_SEED_LEN];
        key.copy_from_slice(&seed);
        let network = Network::Testnet;
        let wallet = Self::internal_new(network, &key, "/tmp/ldk-desktop");
        wallet
    }

    fn internal_new(network: Network, seed_bytes: &[u8], storage_dir_path: &str) -> Self {
        let xprv = ExtendedPrivKey::new_master(network.into(), &seed_bytes).unwrap();
        let wallet_name = bdk::wallet::wallet_name_from_descriptor(
            Bip84(xprv, bdk::KeychainKind::External),
            Some(Bip84(xprv, bdk::KeychainKind::Internal)),
            network.into(),
            &Secp256k1::new(),
        )
        .unwrap();

        let database_path = format!("{}/bdk_wallet_{}.sqlite", storage_dir_path, wallet_name);
        let database = SqliteDatabase::new(database_path);
        let bdk_wallet = bdk::Wallet::new(
            Bip84(xprv, bdk::KeychainKind::External),
            Some(Bip84(xprv, bdk::KeychainKind::Internal)),
            network.into(),
            database,
        )
        .unwrap();
        let url = "http://127.0.0.1:18332"; // bitcoincore testnet
        let path_buf = std::path::PathBuf::from("/home/ecode/.bitcoin/testnet3/.cookie");
        let config = RpcConfig {
            url: url.to_string(),
            auth: Auth::Cookie { file: path_buf },
            network,
            wallet_name,
            sync_params: None,
        };
        let blockchain = RpcBlockchain::from_config(&config).unwrap();
        let wallet_user_selected_name = "wallet 1".replace(" ", "_");
        let mut f = std::fs::File::create(wallet_user_selected_name).unwrap();
        f.write_all(&seed_bytes).unwrap();
        f.sync_all().unwrap();

        Self {
            wallet: bdk_wallet,
            blockchain,
        }
    }

    pub async fn get_new_address(&self) -> AddressInfo {
        let address = self.wallet.get_address(AddressIndex::New).unwrap();
        address
    }

    pub async fn get_spendable_balance(&self) -> u64 {
        let balance = self.wallet.get_balance().unwrap();
        balance.get_spendable()
    }

    pub async fn build_tx(
        &self,
        address: Address,
        amount: Amount,
    ) -> (PartiallySignedTransaction, TransactionDetails) {
        let mut tx_builder = self.wallet.build_tx();
        tx_builder.add_recipient(address.script_pubkey(), amount.to_btc().to_bits());
        let (psbt, details) = tx_builder.finish().unwrap();
        (psbt, details)
    }

    pub async fn sign_tx(&self, psbt: PartiallySignedTransaction) -> PartiallySignedTransaction {
        let mut psbt = psbt.clone();
        self.wallet.sign(&mut psbt, SignOptions::default()).unwrap();
        psbt
    }

    pub async fn broadcast_tx(&self, psbt: PartiallySignedTransaction) -> Result<(), bdk::Error> {
        let tx = psbt.extract_tx();
        self.blockchain.broadcast(&tx)
    }

    pub fn generate_mnemonic() -> Result<Mnemonic, bip39::Error> {
        let m = Mnemonic::generate(12)?;
        Ok(m)
    }
}

#[tauri::command]
pub fn create_wallet() -> Result<String, ()> {
    let (_, mnemonic) = BitcoinWallet::new(Network::Testnet);
    Ok(mnemonic.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use bdk::bitcoin::Network;
    use ldk_node::bip39::Mnemonic;

    #[test]
    fn test_new() {
        let network = Network::Testnet;
        let wallet_1_mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
        let wallet_1_mnemonic: Mnemonic = Mnemonic::parse_normalized(wallet_1_mnemonic).unwrap();
        let storage_dir_path = "/tmp/ldk-desktop";
        // BitcoinWallet::new(network, &wallet_1_mnemonic.to_seed(""), storage_dir_path);
    }
}

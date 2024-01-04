use bdk::blockchain::{rpc::Auth, ConfigurableBlockchain, RpcBlockchain, RpcConfig};
use bdk::wallet::{AddressInfo, AddressIndex};
use bdk::{
    bitcoin::{bip32::ExtendedPrivKey, secp256k1::Secp256k1, Network},
    database::SqliteDatabase,
    template::Bip84,
};
pub struct BitcoinWallet {
    wallet: bdk::Wallet<SqliteDatabase>,
    blockchain: RpcBlockchain,
}

impl BitcoinWallet {
    pub fn new(network: Network, seed_bytes: &[u8], storage_dir_path: &str) -> Self {
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
            network: bdk::bitcoin::Network::Testnet,
            wallet_name,
            sync_params: None,
        };
        let blockchain = RpcBlockchain::from_config(&config).unwrap();
        Self {
            wallet: bdk_wallet,
            blockchain,
        }
    }

	pub async fn get_new_address(&self) -> AddressInfo {
		let address = self.wallet.get_address(AddressIndex::New).unwrap();
		address
	}
}

#[cfg(test)]
mod tests {
    use super::*;
    use bdk::bitcoin::Network;
    use ldk_node::bip39::Mnemonic;

    #[test]
    fn test_new() {
        let network = Network::Testnet;
        let mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
        let mnemonic: Mnemonic = Mnemonic::parse_normalized(mnemonic).unwrap();
        let storage_dir_path = "/tmp/ldk-desktop";
        BitcoinWallet::new(network, &mnemonic.to_seed(""), storage_dir_path);
        assert!(false);
    }
}

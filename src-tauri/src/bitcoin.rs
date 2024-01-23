// #![allow(dead_code)]
// use std::io::Write;
// use std::str::FromStr;
// use std::sync::{Arc, Condvar, Mutex};

// use bdk::bitcoin::psbt::PartiallySignedTransaction;
// use bdk::bitcoin::{self, Address, Amount};
// use bdk::bitcoincore_rpc::core_rpc_json::{AddressType, ListTransactionResult};
// use bdk::bitcoincore_rpc::{self, RpcApi};
// use bdk::blockchain::rpc::RpcSyncParams;
// use bdk::blockchain::Blockchain;
// use bdk::blockchain::{rpc::Auth, ConfigurableBlockchain, RpcBlockchain, RpcConfig};
// use bdk::wallet::{AddressIndex, AddressInfo};
// use bdk::{
//     bitcoin::{bip32::ExtendedPrivKey, secp256k1::Secp256k1, Network},
//     database::SqliteDatabase,
//     template::Bip84,
// };
// use bdk::{BlockTime, SignOptions, SyncOptions};
// use bip39::Mnemonic;
// use directories::{BaseDirs, ProjectDirs, UserDirs};
// use ldk_node::bdk;
// use serde::{Deserialize, Serialize};
// use serde_json::Value;

// const WALLET_KEYS_SEED_LEN: usize = 64;

// pub struct BitcoinWallet {
//     wallet: Mutex<bdk::Wallet<SqliteDatabase>>,
//     sync_lock: (Mutex<()>, Condvar),
//     blockchain: bitcoincore_rpc::Client,
// }

// impl BitcoinWallet {
//     pub fn new(network: Network, wallet_name: String) -> (Arc<Self>, Mnemonic) {
//         let mnemonic = Self::generate_mnemonic().unwrap();
//         let home_dir = UserDirs::new()
//             .unwrap()
//             .home_dir()
//             .to_str()
//             .unwrap()
//             .to_string();
//         let keys_wallet_path = format!("{}/.ldk-desktop-wallet/{}-keys", home_dir, wallet_name);
//         let mut f = std::fs::File::create(keys_wallet_path).unwrap();
//         f.write_all(&mnemonic.to_seed_normalized("")).unwrap();
//         f.sync_all().unwrap();
//         let path_buf = std::path::PathBuf::from("/home/ecode/.bitcoin/testnet3/.cookie");
//         let rpc_client = bitcoincore_rpc::Client::new(
//             &format!("http://127.0.0.1:18332/"),
//             bitcoincore_rpc::Auth::CookieFile(path_buf.clone()),
//         )
//         .unwrap();
//         assert!(rpc_client
//             .create_wallet(&wallet_name, Some(false), None, None, Some(true))
//             .is_ok());
//         let wallet = Self::internal_load(network, &wallet_name);
//         (wallet, mnemonic)
//     }
//     fn load(wallet_name: &str) -> Arc<Self> {
//         let path_buf = std::path::PathBuf::from("/home/ecode/.bitcoin/testnet3/.cookie");
//         let rpc_client = bitcoincore_rpc::Client::new(
//             &format!("http://127.0.0.1:18332/"),
//             bitcoincore_rpc::Auth::CookieFile(path_buf.clone()),
//         )
//         .unwrap();
//         match rpc_client.load_wallet(&wallet_name) {
//             Ok(_) => {}
//             Err(e) => {
//                 dbg!(e);
//             }
//         };

//         let network = Network::Testnet;
//         let wallet = Self::internal_load(network, &wallet_name);
//         wallet
//     }

//     fn internal_load(network: Network, wallet_name: &str) -> Arc<Self> {
//         let home_dir = UserDirs::new()
//             .unwrap()
//             .home_dir()
//             .to_str()
//             .unwrap()
//             .to_string();
//         let keys_wallet_path = format!("{}/.ldk-desktop-wallet/{}-keys", home_dir, wallet_name);
//         let seed = std::fs::read(keys_wallet_path.clone()).unwrap();
//         let bdk_wallet_path = format!(
//             "{}/.ldk-desktop-wallet/bdk_wallet_{}.sqlite",
//             home_dir, wallet_name
//         );
//         let mut seed_bytes = [0; WALLET_KEYS_SEED_LEN];
//         seed_bytes.copy_from_slice(&seed);
//         let xprv = ExtendedPrivKey::new_master(network.into(), &seed_bytes).unwrap();
//         let database = SqliteDatabase::new(bdk_wallet_path);
//         let bdk_wallet = bdk::Wallet::new(
//             Bip84(xprv, bdk::KeychainKind::External),
//             Some(Bip84(xprv, bdk::KeychainKind::Internal)),
//             network.into(),
//             database,
//         )
//         .unwrap();
//         let path_buf = std::path::PathBuf::from("/home/ecode/.bitcoin/testnet3/.cookie");
//         let rpc_client = bitcoincore_rpc::Client::new(
//             &format!("http://127.0.0.1:18332/wallet/{}", &wallet_name),
//             bitcoincore_rpc::Auth::CookieFile(path_buf.clone()),
//         )
//         .unwrap();
//         let sync_lock = (Mutex::new(()), Condvar::new());
//         let res = Arc::new(Self {
//             wallet: Mutex::new(bdk_wallet),
//             sync_lock,
//             blockchain: rpc_client,
//         });
//         res
//     }

//     pub fn get_new_address(&self) -> String {
//         let address = match self.blockchain.get_new_address(None, None) {
//             Ok(address) => address,
//             Err(_) => return "".to_string(),
//         };
//         address
//             .require_network(Network::Testnet)
//             .unwrap()
//             .to_string()
//     }

//     fn build_tx(
//         &self,
//         address: Address,
//         amount: Amount,
//     ) -> (PartiallySignedTransaction, bdk::TransactionDetails) {
//         let wallet = self.wallet.lock().unwrap();
//         let mut tx_builder = wallet.build_tx();
//         tx_builder.add_recipient(address.script_pubkey(), amount.to_btc().to_bits());
//         let (psbt, details) = tx_builder.finish().unwrap();
//         (psbt, details)
//     }

//     fn sign_tx(&self, psbt: PartiallySignedTransaction) -> PartiallySignedTransaction {
//         let mut psbt = psbt.clone();
//         self.wallet
//             .lock()
//             .unwrap()
//             .sign(&mut psbt, SignOptions::default())
//             .unwrap();
//         psbt
//     }

//     pub fn get_balance(&self) -> f64 {
//         let res = match self.blockchain.get_balances() {
//             Ok(res) => res,
//             Err(_) => return 0.0,
//         };
//         return (res.mine.trusted + res.mine.untrusted_pending + res.mine.immature).to_btc();
//     }

//     pub fn rescan_blockchain(&self) {
//         let res = self.blockchain.rescan_blockchain(
//             Some((self.blockchain.get_block_count().unwrap() - 10) as usize),
//             Some((self.blockchain.get_block_count().unwrap()) as usize),
//         );
//         dbg!(&res);
//     }

//     pub fn list_transactions(&self) -> Vec<TransactionInfo> {
//         let res = match self.blockchain.list_transactions(None, None, None, None) {
//             Ok(res) => res,
//             Err(_) => return vec![],
//         };
//         let res = res
//             .into_iter()
//             .map(|tx| {
//                 return TransactionInfo {
//                     txid: tx.info.txid,
//                     time: tx.info.time,
//                     amount: tx.detail.amount.to_btc(),
//                     fee: if let Some(fee) = tx.detail.fee {
//                         Some(fee.to_btc())
//                     } else {
//                         None
//                     },
//                 };
//             })
//             .collect();
//         res
//     }

//     pub async fn broadcast_tx(&self, psbt: PartiallySignedTransaction) -> Result<(), ()> {
//         let tx = psbt.extract_tx();
//         Ok(self
//             .blockchain
//             .send_raw_transaction(&tx)
//             .map(|_| ())
//             .unwrap())
//     }

//     pub fn generate_mnemonic() -> Result<Mnemonic, bip39::Error> {
//         let m = Mnemonic::generate(12)?;
//         Ok(m)
//     }
// }

// #[tauri::command]
// pub fn create_wallet(wallet_name: String) -> Result<String, ()> {
//     let (_, mnemonic) = BitcoinWallet::new(Network::Testnet, wallet_name);
//     Ok(mnemonic.to_string())
// }

// #[tauri::command]
// pub fn get_new_address(wallet_name: String) -> Result<String, ()> {
//     let wallet = BitcoinWallet::load(&wallet_name);
//     Ok(wallet.get_new_address().to_string())
// }

// #[tauri::command]
// pub fn create_transaction(
//     wallet_name: String,
//     address: String,
//     amount: u64,
// ) -> Result<(PartiallySignedTransaction, bdk::TransactionDetails), ()> {
//     let wallet = BitcoinWallet::load(&wallet_name);
//     let tx = wallet.build_tx(
//         bdk::bitcoin::Address::from_str(&address)
//             .unwrap()
//             .assume_checked(),
//         bdk::bitcoin::Amount::from_btc(amount as f64).unwrap(),
//     );
//     Ok(tx)
// }

// #[tauri::command]
// pub fn list_wallets() -> Result<Vec<WalletLoadInfo>, ()> {
//     let mut wallets = vec![];
//     let home_dir = UserDirs::new()
//         .unwrap()
//         .home_dir()
//         .to_str()
//         .unwrap()
//         .to_string();
//     let wallets_dir = format!("{}/.ldk-desktop-wallet/", home_dir);
//     let paths = match std::fs::read_dir(wallets_dir) {
//         Ok(paths) => paths,
//         Err(_) => return Ok(wallets),
//     };
//     dbg!(&paths);
//     for path in paths {
//         let path = path.unwrap();
//         let path = path.path();
//         let path = path.to_str().unwrap();
//         if path.contains(".sqlite") {
//             continue;
//         }
//         let path = path
//             .to_string()
//             .replace(".ldk-desktop-wallet/", "")
//             .replace("-keys", "")
//             .replace(&home_dir.to_string(), "")
//             .replace("/", "");
//         let wallet = load_wallet(path).unwrap();
//         wallets.push(wallet);
//     }
//     Ok(wallets)
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct TransactionInfo {
//     pub txid: bitcoin::Txid,
//     pub time: u64,
//     pub amount: f64,
//     pub fee: Option<f64>,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct WalletLoadInfo {
//     name: String,
//     balance: f64,
//     transactions: Vec<TransactionInfo>,
// }

// #[tauri::command]
// pub fn load_wallet(name: String) -> Result<WalletLoadInfo, ()> {
//     dbg!(&name);
//     let wallet = BitcoinWallet::load(&name);
//     let transactions = wallet.list_transactions();
//     let balance = wallet.get_balance();
//     let new_address = wallet.get_new_address();
//     dbg!(&new_address.to_string());
//     Ok(WalletLoadInfo {
//         name: name.clone(),
//         balance,
//         transactions,
//     })
// }

// #[tauri::command]
// pub fn get_balance(name: String) -> Result<f64, ()> {
//     let wallet = BitcoinWallet::load(&name);
//     let balance = wallet.get_balance();
//     Ok(balance)
// }

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use bdk::bitcoin::Network;
//     use ldk_node::bip39::Mnemonic;

//     #[test]
//     fn test_new() {
//         let network = Network::Testnet;
//         let wallet_1_mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
//         let wallet_1_mnemonic: Mnemonic = Mnemonic::parse_normalized(wallet_1_mnemonic).unwrap();
//         let storage_dir_path = "/tmp/ldk-desktop";
//         // BitcoinWallet::new(network, &wallet_1_mnemonic.to_seed(""), storage_dir_path);
//     }
// }

// // fn hello() {
// //     std::thread::spawn(move || {
// //         tokio::runtime::Builder::new_current_thread()
// //             .enable_all()
// //             .build()
// //             .unwrap()
// //             .block_on(async move {
// //                 let mut onchain_wallet_sync_interval =
// //                     tokio::time::interval(Duration::from_secs(onchain_wallet_sync_interval_secs));
// //                 onchain_wallet_sync_interval
// //                     .set_missed_tick_behavior(tokio::time::MissedTickBehavior::Skip);
// //                 loop {
// //                     tokio::select! { _ = stop_sync.changed() => { return; }
// //                     _ = onchain_wallet_sync_interval.tick() => { let now =
// //                         Instant::now(); match wallet.sync().await { Ok(()) =>
// //                             log_trace!( sync_logger, "Background sync of
// //                                 on-chain wallet finished in {}ms.",
// //                                 now.elapsed().as_millis()), Err(err) => {
// //                                 log_error!( sync_logger, "Background sync of
// //                                     on-chain wallet failed: {}", err) } } } }
// //                 }
// //             });
// //     });
// // }

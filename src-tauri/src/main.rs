// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ldk_node::bitcoin::secp256k1::PublicKey;
use ldk_node::bitcoin::Network;
use ldk_node::io::SqliteStore;
// use ldk_node::lightning_invoice::Invoice;
use ldk_node::{Builder, LogLevel, NetAddress, Node};
use std::str::FromStr;
use std::sync::{Mutex, OnceLock};
use std::thread;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_node_id,
            start_node,
            stop_node,
            spendable_on_chain,
            get_our_address,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_node_id() -> PublicKey {
    let node = init_instance().expect("Failed to initialize node");
    node.node_id()
}

#[tauri::command]
fn start_node() -> bool {
    let node = init_instance().expect("Failed to initialize node");
    match node.start() {
        Ok(_) => {
            dbg!("Node started");
            thread::spawn(|| {
                let event = node.wait_next_event();
                println!("EVENT: {:?}", event);
                node.event_handled();
            });
            return true;
        }
        Err(_) => return false,
    };
}

#[tauri::command]
fn stop_node() -> bool {
    let node = init_instance().expect("Failed to initialize node");
    match node.stop() {
        Ok(_) => return true,
        Err(_) => return false,
    };
}

#[tauri::command]
fn spendable_on_chain() -> u64 {
    let node = init_instance().expect("Failed to initialize node");
    return node.spendable_onchain_balance_sats().unwrap();
}

#[tauri::command]
fn get_our_address() -> String {
    let node = init_instance().expect("Failed to initialize node");
    return node.listening_address().unwrap().to_string();
}

static OUR_NODE: OnceLock<Node<SqliteStore>> = OnceLock::new();
static IS_OUR_NODE_INIT: OnceLock<std::sync::Mutex<bool>> = OnceLock::new();

pub fn init_instance() -> Option<&'static Node<SqliteStore>> {
    match OUR_NODE.get() {
        Some(_) => return OUR_NODE.get(),
        None => {
            let initializing_mutex: &Mutex<bool> =
                IS_OUR_NODE_INIT.get_or_init(|| std::sync::Mutex::new(false));
            let mut initialized = initializing_mutex.lock().unwrap();
            if !*initialized {
                let mut builder = Builder::new();
                builder.set_network(Network::Testnet);
                builder.set_log_level(LogLevel::Gossip);
                builder.set_listening_address(NetAddress::from_str("0.0.0.0:9735").unwrap());
                builder.set_esplora_server("http://127.0.0.1:3001".to_string());
                builder.set_gossip_source_rgs(
                    "https://rapidsync.lightningdevkit.org/testnet/snapshot".to_string(),
                );
                let node: Node<SqliteStore> = builder.build().unwrap();
                if let Ok(_) = OUR_NODE.set(node) {
                    *initialized = true;
                };
            };
            drop(initialized);
            OUR_NODE.get()
        }
    }
}

// node.start().expect("Failed to start node");
// let node_id = node.node_id();
// dbg!(&node_id);
// let total_onchain_balance_sats = node.total_onchain_balance_sats().unwrap();
// dbg!(&total_onchain_balance_sats);

// tb1qmghmcgmnyul8p29jcemv0m4ffv3sqprlm9q4fm

// let client_option = OUR_NODE.get();
// if let Some(_) = client_option {
//     return Some(OUR_NODE.get());
// }
//   let initializing_mutex = MONGO_INITIALIZED.get_or_init( std::sync::Mutex::new(false));
//   let mut initialized = initializing_mutex.lock().unwrap();
//   if !*initialized {
//      let uri = std::env::var("MONGODB_URI")
//         .unwrap_or_else(_ "mongodb+srv://test:test@cluster0.kwsrpgy.mongodb.net/".into());
//      let mut client_options = ClientOptions::parse(uri).await?;
//      client_options.app_name = Some("mymongo".to_string());
//      if let Ok(client) = Client::with_options(client_options) {
//         if let Ok(_) = MONGO.set(client) {
//            *initialized = true;
//           dbg!("Debug: Mongodb started @ 27017");
//         }
//      }
// };
// drop(initialized);
//   Ok(MONGO.get())
// let mut builder = Builder::new();
// builder.set_network(Network::Testnet);
// builder.set_log_level(LogLevel::Gossip);
// builder.set_esplora_server("http://127.0.0.1:3001".to_string());
// builder.set_gossip_source_rgs(
//     "https://rapidsync.lightningdevkit.org/testnet/snapshot".to_string(),
// );

// let node = builder.build().unwrap();
// // let onchain_address = node.new_onchain_address().unwrap();
// // dbg!(&onchain_address);
// // let s = match node.sync_wallets() {
// //     Ok(s) => s,
// //     Err(e) => {
// //         dbg!(e);
// //         return;
// //     }
// // };

// // .. fund address ..

// let node_id = node.node_id();
// dbg!(&node_id);
// let spendable = node.spendable_onchain_balance_sats().unwrap();
// dbg!(&spendable);
// // node.connect_open_channel(node_id, node_addr, 10000, None, None, false)
// //     .unwrap();

// let event = node.wait_next_event();
// println!("EVENT: {:?}", event);
// node.event_handled();

// // let invoice = Invoice::from_str("INVOICE_STR").unwrap();
// // node.send_payment(&invoice).unwrap();

// node.stop().unwrap();

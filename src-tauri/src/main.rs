// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ldk_node::{Builder, NetAddress};
use ldk_node::lightning_invoice::Invoice;
use ldk_node::bitcoin::secp256k1::PublicKey;
use ldk_node::bitcoin::Network;
use std::str::FromStr;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![start_ldk])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn start_ldk(name: &str, network: Network, esplora_server: String, gossip_source_rgs: String) -> String {
	let mut builder = Builder::new();
	builder.set_network(network);
	builder.set_esplora_server(esplora_server);
	builder.set_gossip_source_rgs(gossip_source_rgs);

	let node = builder.build().unwrap();

	// node.start().unwrap();

	// let funding_address = node.new_onchain_address();

	// // .. fund address ..

	// let node_id = PublicKey::from_str("NODE_ID").unwrap();
	// let node_addr = NetAddress::from_str("IP_ADDR:PORT").unwrap();
	// node.connect_open_channel(node_id, node_addr, 10000, None, false).unwrap();

	// let event = node.wait_next_event();
	// println!("EVENT: {:?}", event);
	// node.event_handled();

	// let invoice = Invoice::from_str("INVOICE_STR").unwrap();
	// node.send_payment(&invoice).unwrap();

	// node.stop().unwrap();
    format!("Hello, {}! You've been greeted from Rust!", name)
}

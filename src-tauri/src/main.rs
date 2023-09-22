// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ldk_node::bitcoin::secp256k1::PublicKey;
use ldk_node::bitcoin::{Network, OutPoint};
use ldk_node::io::SqliteStore;
use ldk_node::{Builder, ChannelDetails, LogLevel, NetAddress, Node};
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
            connect_to_node,
            list_peers,
            new_onchain_address,
            list_channels,
            open_channel,
            total_onchain_balance,
            is_node_running,
            sync_wallet
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_node_id() -> PublicKey {
    let node = init_instance().expect("Failed to initialize node");
    let node_id = node.node_id();
    dbg!(&node_id);
    node_id
}

#[tauri::command]
fn start_node() -> bool {
    let node = init_instance().expect("Failed to initialize node");
    match node.start() {
        Ok(_) => {
            dbg!("Node started");
            thread::spawn(|| loop {
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
fn is_node_running() -> bool {
    let node = init_instance().expect("Failed to initialize node");
    let res = node.is_node_running();
    dbg!(&res);
    res
}

#[tauri::command]
fn new_onchain_address() -> String {
    let node = init_instance().expect("Failed to initialize node");
    match node.new_onchain_address() {
        Ok(a) => a.to_string(),
        Err(e) => {
            dbg!(e);
            "".to_string()
        }
    }
}

#[tauri::command]
fn open_channel() -> bool {
    let node = init_instance().expect("Failed to initialize node");
    let target_node_id = match PublicKey::from_str(
        "03353b7ac6dc4f1efec4591fe33344040d189680d6096b3f2b0e050e841b169a3f",
    ) {
        Ok(key) => key,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    let target_address = match NetAddress::from_str("0.0.0.0:9733") {
        Ok(address) => address,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    let channel_amount_sats = 4500;
    let push_to_counterparty_msat: Option<u64> = Some(100);
    let channel_config = None;
    let announce_channel: bool = false;
    match node.connect_open_channel(
        target_node_id,
        target_address,
        channel_amount_sats,
        push_to_counterparty_msat,
        channel_config,
        announce_channel,
    ) {
        Ok(_) => true,
        Err(e) => {
            dbg!(&e);
            false
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize)]
struct ChanDetails {
    // pub channel_id: ChannelId,
    pub counterparty_node_id: PublicKey,
    pub funding_txo: Option<OutPoint>,
    pub channel_value_sats: u64,
    pub unspendable_punishment_reserve: Option<u64>,
    // pub user_channel_id: UserChannelId,
    pub feerate_sat_per_1000_weight: u32,
    pub balance_msat: u64,
    pub outbound_capacity_msat: u64,
    pub inbound_capacity_msat: u64,
    pub confirmations_required: Option<u32>,
    pub confirmations: Option<u32>,
    pub is_outbound: bool,
    pub is_channel_ready: bool,
    pub is_usable: bool,
    pub is_public: bool,
    pub cltv_expiry_delta: Option<u16>,
}

impl From<ChannelDetails> for ChanDetails {
    fn from(channel_details: ChannelDetails) -> Self {
        ChanDetails {
            counterparty_node_id: channel_details.counterparty_node_id,
            funding_txo: channel_details.funding_txo,
            channel_value_sats: channel_details.channel_value_sats,
            unspendable_punishment_reserve: channel_details.unspendable_punishment_reserve,
            feerate_sat_per_1000_weight: channel_details.feerate_sat_per_1000_weight,
            balance_msat: channel_details.balance_msat,
            outbound_capacity_msat: channel_details.outbound_capacity_msat,
            inbound_capacity_msat: channel_details.inbound_capacity_msat,
            confirmations_required: channel_details.confirmations_required,
            confirmations: channel_details.confirmations,
            is_outbound: channel_details.is_outbound,
            is_channel_ready: channel_details.is_channel_ready,
            is_usable: channel_details.is_usable,
            is_public: channel_details.is_public,
            cltv_expiry_delta: channel_details.cltv_expiry_delta,
        }
    }
}

#[tauri::command]
fn list_channels() -> Vec<ChanDetails> {
    let node = init_instance().expect("Failed to initialize node");
    node.list_channels()
        .into_iter()
        .map(|c: ChannelDetails| ChanDetails::from(c))
        .collect()
}

#[tauri::command]
fn sync_wallet() -> bool {
    let node = init_instance().expect("Failed to initialize node");
    match node.sync_wallets() {
        Ok(_) => true,
        Err(e) => {
            dbg!(&e);
            false
        }
    }
}

#[tauri::command]
fn connect_to_node() -> bool {
    let node = init_instance().expect("Failed to initialize node");
    let pub_key = match PublicKey::from_str(
        "03353b7ac6dc4f1efec4591fe33344040d189680d6096b3f2b0e050e841b169a3f",
    ) {
        Ok(key) => key,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    // ip "wise-moles-lie.loca.lt:9735"
    let listening_address = match NetAddress::from_str("0.0.0.0:9733") {
        Ok(address) => address,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    match node.connect(pub_key, listening_address, true) {
        Ok(_) => return true,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
}

#[tauri::command]
fn list_peers() -> Vec<String> {
    let node = init_instance().expect("Failed to initialize node");
    node.list_peers()
        .into_iter()
        .map(|peer| peer.node_id.to_string())
        .collect()
}

#[tauri::command]
fn spendable_on_chain() -> u64 {
    let node = init_instance().expect("Failed to initialize node");
    return node.spendable_onchain_balance_sats().unwrap();
}

#[tauri::command]
fn total_onchain_balance() -> u64 {
    let node = init_instance().expect("Failed to initialize node");
    let total_balance = node.total_onchain_balance_sats().unwrap();
    dbg!(&total_balance);
    return total_balance;
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
                builder.set_log_level(LogLevel::Error);
                builder.set_log_level(LogLevel::Gossip);
                builder.set_log_level(LogLevel::Debug);
                builder.set_log_level(LogLevel::Info);
                builder.set_log_level(LogLevel::Warn);
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

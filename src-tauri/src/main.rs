// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ldk_node::bitcoin::secp256k1::PublicKey;
use ldk_node::bitcoin::{Network, OutPoint};
use ldk_node::io::SqliteStore;
use ldk_node::lightning_invoice::{Bolt11Invoice, SignedRawBolt11Invoice};
use ldk_node::{
    Builder, ChannelDetails, LogLevel, NetAddress, Node, PaymentDetails,
    PaymentDirection, PaymentStatus, PeerDetails,
};
use std::fs::File;
use std::io::{BufRead, BufReader};
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
            get_logs,
            connect_to_node,
            list_peers,
            new_onchain_address,
            disconnect_peer,
            list_channels,
            create_invoice,
            pay_invoice,
            open_channel,
            total_onchain_balance,
            is_node_running,
            sync_wallet,
            list_payments,
            get_network,
            get_height,
            get_storage_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_node_id() -> String {
    if !is_node_running() {
        return "".to_string();
    }
    let node = init_instance(None).expect("Failed to initialize node");
    node.node_id().to_string()
}

#[tauri::command]
fn start_node(
    network: Network,
    storage_dir: String,
    listening_address: String,
    esplora_address: String,
) -> bool {
    let conf = NodeConf {
        network,
        storage_dir,
        listening_address,
        esplora_address,
    };
    dbg!(&conf);
    let node = init_instance(Some(conf)).expect("Failed to initialize node");
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
    let node = init_instance(None).expect("Failed to initialize node");
    match node.stop() {
        Ok(_) => {
            dbg!("Node stopped");
            return true;
        }
        Err(_) => return false,
    };
}

#[tauri::command]
fn is_node_running() -> bool {
    match init_instance(None) {
        Some(node) => node.is_node_running(),
        None => false,
    }
}

#[tauri::command]
fn get_storage_dir() -> Option<String> {
    if !is_node_running() {
        return None;
    }
    let node = init_instance(None).expect("Failed to initialize node");
    Some(node.storage_dir_path())
}

#[tauri::command]
fn new_onchain_address() -> String {
    let empty_result = "".to_string();
    if !is_node_running() {
        return empty_result;
    }
    let node = init_instance(None).expect("Failed to initialize node");
    match node.new_onchain_address() {
        Ok(a) => a.to_string(),
        Err(e) => {
            dbg!(e);
            "".to_string()
        }
    }
}

#[tauri::command]
fn open_channel(
    node_id: String,
    net_address: String,
    channel_amount_sats: u64,
    push_to_counterparty_msat: u64,
    announce_channel: bool,
) -> bool {
    let empty_result = false;
    if !is_node_running() {
        return empty_result;
    }
    let node = init_instance(None).expect("Failed to initialize node");
    let target_node_id = match PublicKey::from_str(&node_id) {
        Ok(key) => key,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };

    let target_address = match NetAddress::from_str(&net_address) {
        Ok(address) => address,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };

    let push_to_counterparty_msat: Option<u64> = if push_to_counterparty_msat > 1 {
        Some(push_to_counterparty_msat)
    } else {
        None
    };

    let channel_config = None;
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
    pub channel_id: [u8; 32],
    pub counterparty_node_id: PublicKey,
    pub funding_txo: Option<OutPoint>,
    pub channel_value_sats: u64,
    pub unspendable_punishment_reserve: Option<u64>,
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
            channel_id: channel_details.channel_id.0,
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

#[derive(serde::Serialize, serde::Deserialize, Debug)]
struct WrappedPaymentDetails {
    /// The payment hash, i.e., the hash of the `preimage`.
    pub hash: [u8; 32],
    /// The pre-image used by the payment.
    pub preimage: Option<[u8; 32]>,
    /// The secret used by the payment.
    pub secret: Option<[u8; 32]>,
    /// The amount transferred.
    pub amount_msat: Option<u64>,
    /// The direction of the payment.
    pub direction: String,
    /// The status of the payment.
    pub status: String,
}

impl From<PaymentDetails> for WrappedPaymentDetails {
    fn from(payment_details: PaymentDetails) -> Self {
        return WrappedPaymentDetails {
            hash: payment_details.hash.0,
            preimage: match payment_details.preimage {
                Some(p) => Some(p.0),
                None => None,
            },
            secret: match payment_details.secret {
                Some(s) => Some(s.0),
                None => None,
            },
            amount_msat: payment_details.amount_msat,
            direction: match payment_details.direction {
                PaymentDirection::Inbound => "Inbound".to_string(),
                PaymentDirection::Outbound => "Outbound".to_string(),
            },
            status: match payment_details.status {
                PaymentStatus::Pending => "Pending".to_string(),
                PaymentStatus::Succeeded => "Succeeded".to_string(),
                PaymentStatus::Failed => "Failed".to_string(),
            },
        };
    }
}

#[tauri::command]
fn list_payments() -> Vec<WrappedPaymentDetails> {
    if !is_node_running() {
        return vec![];
    }
    let node = init_instance(None).expect("Failed to initialize node");
    node.list_payments()
        .into_iter()
        .map(|c: PaymentDetails| WrappedPaymentDetails::from(c))
        .collect()
}

#[tauri::command]
fn list_channels() -> Vec<ChanDetails> {
    if !is_node_running() {
        return vec![];
    }
    let node = init_instance(None).expect("Failed to initialize node");
    node.list_channels()
        .into_iter()
        .map(|c: ChannelDetails| ChanDetails::from(c))
        .collect()
}

#[tauri::command]
fn sync_wallet() -> bool {
    if !is_node_running() {
        return false;
    }
    let node = init_instance(None).expect("Failed to initialize node");
    return node.sync_wallets().is_ok();
}

#[tauri::command]
fn create_invoice(amount_msat: u64, description: &str, expiry_secs: u32) -> Option<String> {
    if !is_node_running() {
        return None;
    }
    let node = init_instance(None).expect("Failed to initialize node");
    match node.receive_payment(amount_msat, description, expiry_secs) {
        Ok(i) => Some(i.into_signed_raw().to_string()),
        Err(e) => {
            dbg!(&e);
            None
        }
    }
}

/// returns payment hash if successful
#[tauri::command]
fn pay_invoice(invoice: String) -> Option<[u8; 32]> {
    if !is_node_running() {
        return None;
    }
    let node = init_instance(None).expect("Failed to initialize node");
    let invoice = match SignedRawBolt11Invoice::from_str(&invoice) {
        Ok(i) => i,
        Err(e) => {
            dbg!(&e);
            return None;
        }
    };
    let invoice = match Bolt11Invoice::from_signed(invoice) {
        Ok(i) => i,
        Err(e) => {
            dbg!(&e);
            return None;
        }
    };
    match node.send_payment(&invoice) {
        Ok(p) => Some(p.0),
        Err(e) => {
            dbg!(&e);
            None
        }
    }
}

#[tauri::command]
fn disconnect_peer(node_id: String) -> bool {
    if !is_node_running() {
        return false;
    }
    let node = init_instance(None).expect("Failed to initialize node");
    let pub_key = match PublicKey::from_str(&node_id) {
        Ok(key) => key,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    match node.disconnect(pub_key) {
        Ok(_) => return true,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
}

#[tauri::command]
fn connect_to_node(node_id: String, net_address: String) -> bool {
    if !is_node_running() {
        return false;
    }
    let persist = true;
    let node = init_instance(None).expect("Failed to initialize node");
    let pub_key = match PublicKey::from_str(&node_id) {
        Ok(key) => key,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    let listening_address = match NetAddress::from_str(&net_address) {
        Ok(address) => address,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    match node.connect(pub_key, listening_address, persist) {
        Ok(_) => return true,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
struct WrappedPeerDetails {
    /// The node ID of the peer.
    pub node_id: PublicKey,
    /// The network address of the peer.
    pub address: String,
    /// Indicates whether we'll try to reconnect to this peer after restarts.
    pub is_persisted: bool,
    /// Indicates whether we currently have an active connection with the peer.
    pub is_connected: bool,
}

impl From<PeerDetails> for WrappedPeerDetails {
    fn from(peer_details: PeerDetails) -> Self {
        WrappedPeerDetails {
            node_id: peer_details.node_id,
            address: peer_details.address.to_string(),
            is_persisted: peer_details.is_persisted,
            is_connected: peer_details.is_connected,
        }
    }
}

#[tauri::command]
fn list_peers() -> Vec<WrappedPeerDetails> {
    if !is_node_running() {
        return vec![];
    }
    let node = init_instance(None).expect("Failed to initialize node");
    node.list_peers()
        .into_iter()
        .map(|peer: PeerDetails| peer.into())
        .collect()
}

#[tauri::command]
fn spendable_on_chain() -> u64 {
    if !is_node_running() {
        return 0;
    }
    let node = init_instance(None).expect("Failed to initialize node");
    match node.spendable_onchain_balance_sats() {
        Ok(b) => return b,
        Err(e) => {
            dbg!(&e);
            return 0;
        }
    }
}

#[tauri::command]
async fn get_height() -> Result<u32, ()> {
    if !is_node_running() {
        return Ok(0);
    }
    let node = init_instance(None).expect("Failed to initialize node");
    node.height().await.map_err(|_| ())
}

#[tauri::command]
fn get_network() -> Option<Network> {
    if !is_node_running() {
        return None;
    }
    let node = init_instance(None).expect("Failed to initialize node");
    Some(node.network())
}

#[tauri::command]
fn total_onchain_balance() -> u64 {
    if !is_node_running() {
        return 0;
    }
    let node = init_instance(None).expect("Failed to initialize node");
    match node.total_onchain_balance_sats() {
        Ok(b) => return b,
        Err(e) => {
            dbg!(&e);
            return 0;
        }
    }
}

#[tauri::command]
fn get_logs() -> Vec<String> {
    let mut buffer = Vec::new();
    let node = init_instance(None).expect("Failed to initialize node");
    let storage_dir = node.storage_dir_path();
    let logs_dir = format!("{}/logs/ldk_node_latest.log", storage_dir);
    let file = match File::open(logs_dir) {
        Ok(f) => f,
        Err(e) => {
            dbg!(&e);
            return vec![];
        }
    };
    let reader = BufReader::new(file);
    for line in reader.lines() {
        let line = match line {
            Ok(l) => l,
            Err(e) => {
                dbg!(&e);
                continue;
            }
        };
        buffer.push(line);
    }
    buffer
}

#[tauri::command]
fn get_our_address() -> String {
    let empty_result = "".to_string();
    if !is_node_running() {
        return empty_result;
    }
    let node = init_instance(None).expect("Failed to initialize node");
    match node.listening_address() {
        Some(b) => {
            let res = b.to_string();
            return res;
        }
        None => {
            return empty_result;
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct NodeConf {
    pub network: Network,
    pub storage_dir: String,
    pub listening_address: String,
    pub esplora_address: String,
}

static IS_OUR_NODE_INIT: OnceLock<std::sync::Mutex<bool>> = OnceLock::new();
static OUR_NODE: OnceLock<Node<SqliteStore>> = OnceLock::new();

pub fn init_instance(init_config: Option<NodeConf>) -> Option<&'static Node<SqliteStore>> {
    match OUR_NODE.get() {
        Some(_) => return OUR_NODE.get(),
        None => {
            let config = match init_config {
                Some(c) => c,
                None => {
                    // dbg!("No config provided for initial node instance");
                    return None;
                }
            };
            dbg!(&config);
            let initializing_mutex: &Mutex<bool> =
                IS_OUR_NODE_INIT.get_or_init(|| std::sync::Mutex::new(false));
            let mut initialized = initializing_mutex.lock().unwrap();
            if !*initialized {
                let mut builder = Builder::new();
                builder.set_network(Network::Testnet);
                builder.set_log_level(LogLevel::Error);
                builder.set_log_level(LogLevel::Trace);
                builder.set_log_dir_path(format!("{}/logs", &config.storage_dir));
                builder.set_storage_dir_path(config.storage_dir);
                builder.set_listening_address(
                    NetAddress::from_str(&config.listening_address).unwrap(),
                );
                builder.set_esplora_server(config.esplora_address);
                builder.set_gossip_source_rgs(
                    "https://rapidsync.lightningdevkit.org/testnet/snapshot".to_string(),
                );
                let node: Node<SqliteStore> = builder.build().unwrap();
                if let Ok(_) = OUR_NODE.set(node) {
                    *initialized = true;
                };
            }
            drop(initialized);
            OUR_NODE.get()
        }
    }
}

use ldk_node::bitcoin::secp256k1::PublicKey;
use ldk_node::bitcoin::OutPoint;
use ldk_node::io::sqlite_store::SqliteStore;
use ldk_node::lightning::ln::msgs::SocketAddress;
use ldk_node::lightning::ln::ChannelId;
use ldk_node::lightning_invoice::{Bolt11Invoice, SignedRawBolt11Invoice};
use ldk_node::{
    Builder, ChannelDetails, LogLevel, Network, Node, PaymentDetails, PaymentDirection,
    PaymentStatus, PeerDetails,
};
use std::collections::HashMap;
use std::str::FromStr;
use std::sync::{Arc, RwLock};
use std::thread;

use crate::paths::UserPaths;
use crate::wallet::WalletConfig;

#[tauri::command]
pub fn start_node(node_name: String) -> (bool, String) {
    let seed = match std::fs::read(UserPaths::new().seed_file(node_name.clone())) {
        Ok(s) => s,
        Err(e) => {
            return (false, e.to_string());
        }
    };
    let config_file = UserPaths::new().config_file(node_name.clone());
    let config_file = match std::fs::read(config_file) {
        Ok(s) => s,
        Err(e) => {
            return (false, e.to_string());
        }
    };
    let config: WalletConfig = match serde_json::from_slice(&config_file) {
        Ok(c) => c,
        Err(e) => {
            return (false, e.to_string());
        }
    };
    init_lazy(Arc::new(NodeConf {
        network: ldk_node::bitcoin::Network::Testnet,
        seed,
        storage_dir: UserPaths::new().ldk_data_dir(node_name.clone()),
        listening_address: config.get_listening_address(),
        esplora_address: config.get_esplora_address(),
    }))
}

#[tauri::command]
pub fn get_node_id(node_name: String) -> String {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return "".to_string();
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return "".to_string();
        }
    };
    node.node_id().to_string()
}

#[tauri::command]
pub fn stop_node(node_name: String) -> bool {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return false;
        }
    };
    match node.stop() {
        Ok(_) => {
            dbg!("Node stopped");
            return true;
        }
        Err(_) => return false,
    };
}

#[tauri::command]
pub fn is_node_running(node_name: String) -> bool {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return false;
        }
    };
    node.is_running()
}

#[tauri::command]
pub fn new_onchain_address(node_name: String) -> String {
    let empty_result = "".to_string();
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return empty_result;
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return empty_result;
        }
    };
    match node.new_onchain_address() {
        Ok(a) => a.to_string(),
        Err(e) => {
            dbg!(e);
            "".to_string()
        }
    }
}

#[tauri::command]
pub fn close_channel(node_name: String, node_id: String, channel_id: [u8; 32]) -> bool {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return false;
        }
    };
    let pub_key = match PublicKey::from_str(&node_id) {
        Ok(key) => key,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    let channel_id = ChannelId(channel_id);
    match node.close_channel(&channel_id, pub_key) {
        Ok(_) => return true,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
}

#[tauri::command]
pub fn open_channel(
    node_name: String,
    node_id: String,
    net_address: String,
    channel_amount_sats: u64,
    push_to_counterparty_msat: u64,
    announce_channel: bool,
) -> bool {
    let empty_result = false;
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return empty_result;
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return empty_result;
        }
    };
    let target_node_id = match PublicKey::from_str(&node_id) {
        Ok(key) => key,
        Err(e) => {
            dbg!(&e);
            return empty_result;
        }
    };

    let target_address = match SocketAddress::from_str(&net_address) {
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
pub struct ChanDetails {
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
pub struct WrappedPaymentDetails {
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
pub fn list_payments(node_name: String) -> Vec<WrappedPaymentDetails> {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return vec![];
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return vec![];
        }
    };
    node.list_payments()
        .into_iter()
        .map(|c: PaymentDetails| WrappedPaymentDetails::from(c))
        .collect()
}

#[tauri::command]
pub fn list_channels(node_name: String) -> Vec<ChanDetails> {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return vec![];
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return vec![];
        }
    };
    node.list_channels()
        .into_iter()
        .map(|c: ChannelDetails| ChanDetails::from(c))
        .collect()
}

#[tauri::command]
pub fn create_invoice(
    node_name: String,
    amount_msat: u64,
    description: &str,
    expiry_secs: u32,
) -> Option<String> {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return None;
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return None;
        }
    };
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
pub fn pay_invoice(node_name: String, invoice: String) -> Option<[u8; 32]> {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return None;
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return None;
        }
    };
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
pub fn disconnect_peer(node_name: String, node_id: String) -> bool {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return false;
        }
    };
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
pub fn connect_to_node(our_node_name: String, node_id: String, net_address: String) -> bool {
    let persist = true;
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(our_node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return false;
        }
    };
    let pub_key = match PublicKey::from_str(&node_id) {
        Ok(key) => key,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    let listening_address = match SocketAddress::from_str(&net_address) {
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
pub struct WrappedPeerDetails {
    /// The node ID of the peer.
    pub node_id: PublicKey,
    /// The network address of the peer.
    pub address: String,
    /// Indicates whether we'll try to reconnect to this peer after restarts.
    pub is_persisted: bool,
    /// Indicates whether we currently have an active connection with the peer.
    pub is_connected: bool,
    /// The alias of the peer, if known.
    pub alias: String,
}

impl From<PeerDetails> for WrappedPeerDetails {
    fn from(peer_details: PeerDetails) -> Self {
        WrappedPeerDetails {
            node_id: peer_details.node_id,
            address: peer_details.address.to_string(),
            alias: "".to_string(),
            is_persisted: peer_details.is_persisted,
            is_connected: peer_details.is_connected,
        }
    }
}

#[tauri::command]
pub fn list_peers(node_name: String) -> Vec<WrappedPeerDetails> {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return vec![];
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return vec![];
        }
    };
    node.list_peers()
        .into_iter()
        .map(|peer: PeerDetails| peer.into())
        .collect()
}

#[tauri::command]
pub fn spendable_on_chain(node_name: String) -> u64 {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return 0;
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return 0;
        }
    };
    match node.spendable_onchain_balance_sats() {
        Ok(b) => return b,
        Err(e) => {
            dbg!(&e);
            return 0;
        }
    }
}

#[tauri::command]
pub fn total_onchain_balance(node_name: String) -> u64 {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return 0;
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return 0;
        }
    };
    match node.total_onchain_balance_sats() {
        Ok(b) => {
            return b;
        }
        Err(e) => {
            dbg!(&e);
            return 0;
        }
    }
}

#[tauri::command]
pub fn get_our_address(node_name: String) -> String {
    let config_file = UserPaths::new().config_file(node_name);
    let config_file = match std::fs::read(config_file) {
        Ok(s) => s,
        Err(e) => {
            dbg!(&e);
            return "".to_string();
        }
    };
    let config: WalletConfig = match serde_json::from_slice(&config_file) {
        Ok(c) => c,
        Err(_) => return "".to_string(),
    };
    return config.get_listening_address();
}

#[tauri::command]
pub fn get_esplora_address(node_name: String) -> String {
    let config_file = UserPaths::new().config_file(node_name);
    dbg!(&config_file);
    let config_file = match std::fs::read(config_file) {
        Ok(s) => s,
        Err(e) => {
            dbg!(&e);
            return "".to_string();
        }
    };

    let config: WalletConfig = match serde_json::from_slice(&config_file) {
        Ok(c) => c,
        Err(_) => return "".to_string(),
    };
    dbg!(&config);
    return config.get_esplora_address();
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct NodeConf {
    pub network: ldk_node::bitcoin::Network,
    pub storage_dir: String,
    pub listening_address: String,
    pub seed: Vec<u8>,
    pub esplora_address: String,
}

lazy_static! {
    static ref NODES: RwLock<HashMap<String, Arc<Node<SqliteStore>>>> = RwLock::new(HashMap::new());
}

pub fn init_lazy(config: Arc<NodeConf>) -> (bool, String) {
    let storage_dir = config.storage_dir.clone();
    let mut builder = Builder::new();
    builder.set_network(Network::Testnet);
    builder.set_log_level(LogLevel::Info);
    builder.set_storage_dir_path(storage_dir.clone());
    builder.set_log_dir_path(format!("{}/logs", &config.storage_dir));
    let socket_address = match SocketAddress::from_str(&config.listening_address) {
        Ok(s) => s,
        Err(e) => {
            return (false, e.to_string());
        }
    };
    let builder = match builder.set_listening_addresses(vec![socket_address]) {
        Ok(b) => b,
        Err(e) => {
            return (false, e.to_string());
        }
    };
    builder.set_esplora_server(config.esplora_address.clone());
    builder.set_gossip_source_rgs(
        "https://rapidsync.lightningdevkit.org/testnet/snapshot".to_string(),
    );
    let builder = match builder.set_entropy_seed_bytes(config.seed.clone()) {
        Ok(b) => b,
        Err(e) => {
            return (false, e.to_string());
        }
    };
    let node = match builder.build() {
        Ok(n) => n,
        Err(e) => {
            return (false, e.to_string());
        }
    };
    let node = Arc::new(node);
    let mut nodes = match NODES.write() {
        Ok(n) => n,
        Err(e) => {
            return (false, e.to_string());
        }
    };
    nodes.insert(storage_dir.clone(), node.clone());
    match node.clone().start() {
        Ok(_) => {
            dbg!("Node started");
            thread::spawn(move || loop {
                let event = node.clone().wait_next_event();
                println!("EVENT: {:?}", event);
                node.event_handled();
            });
            (true, "".to_string())
        }
        Err(e) => {
            return (false, e.to_string());
        }
    }
}

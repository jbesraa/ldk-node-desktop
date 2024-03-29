use ldk_node::bitcoin::secp256k1::PublicKey;
use ldk_node::bitcoin::{Network, OutPoint};
use ldk_node::lightning::ln::msgs::SocketAddress;
use ldk_node::lightning::offers::offer::Offer;
use ldk_node::lightning_invoice::{Bolt11Invoice, SignedRawBolt11Invoice};
use ldk_node::payment::PaymentDirection;
use ldk_node::{Builder, ChannelDetails, LogLevel, Node, PeerDetails, UserChannelId};
use std::collections::HashMap;
use std::str::FromStr;
use std::sync::{Arc, RwLock};
use std::thread;

use crate::account;
use crate::paths::UserPaths;
use crate::wallet::WalletConfig;

use actix_web::{web, HttpRequest, HttpResponse, Responder};

// .get("http://0.0.0.0:8283/payment/bolt12/offer")
pub async fn get_account_offer(request: HttpRequest) -> impl Responder {
    let headers = request.headers();
    let token = headers.get("authorization").unwrap();
    let (_, node_name) = account::verify_jwt(token.to_str().unwrap());
    dbg!(&node_name);
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            panic!("")
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            panic!("")
        }
    };
    let t = token.to_str().unwrap();
    dbg!(&t);
    let offer = node.bolt12_payment().receive(10 * 10, &t).unwrap();
    dbg!(&offer);

    HttpResponse::Ok().body(offer.to_string())
}

pub async fn pay_account_offer(request: HttpRequest, body: web::Bytes) -> impl Responder {
    let headers = request.headers();
    let token = headers.get("authorization").unwrap();
    let offer = String::from_utf8(body.to_vec()).unwrap();
    let (_, node_name) = account::verify_jwt(token.to_str().unwrap());
    dbg!(&node_name);
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            panic!("")
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            panic!("")
        }
    };
    let t = token.to_str().unwrap();
    dbg!(&t);
    let res = match node.bolt12_payment().send(
        &Offer::from_str(&offer).unwrap(),
        Some(token.to_str().unwrap().to_string()),
    ) {
        Ok(_) => "true",
        Err(_) => ""
    };

    HttpResponse::Ok().body(res)
}

pub async fn get_account_balance(request: HttpRequest) -> impl Responder {
    let headers = request.headers();
    let token = headers.get("authorization").unwrap();
    let (_, node_name) = account::verify_jwt(token.to_str().unwrap());
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return HttpResponse::Ok().body("".to_string());
            // return "".to_string();
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return HttpResponse::Ok().body("".to_string());
            // return "".to_string();
        }
    };

    let inbound_payments = node.list_payments_with_filter(|p| {
        p.direction == PaymentDirection::Inbound
            && p.user_token == token.to_str().unwrap().to_string()
    });

    let outbound_payments = node.list_payments_with_filter(|p| {
        p.direction == PaymentDirection::Outbound
            && p.user_token == token.to_str().unwrap().to_string()
    });

    let mut balance = 0;

    for payment in inbound_payments {
        if let Some(amount) = payment.amount_msat {
            balance = balance + amount;
        }
    }

    for payment in outbound_payments {
        if let Some(amount) = payment.amount_msat {
            balance = balance - amount;
        }
    }
    // dbg!(&balance);

    HttpResponse::Ok().body(balance.to_string())
}

#[tauri::command]
pub fn start_node(node_name: String) -> (bool, String) {
    let seed = match std::fs::read(UserPaths::new().seed_file(&node_name)) {
        Ok(s) => s,
        Err(e) => {
            return (false, e.to_string());
        }
    };
    let config = match WalletConfig::new(&node_name) {
        Ok(c) => c,
        Err(e) => {
            return (false, e.to_string());
        }
    };
    dbg!(&config);
    init_lazy(Arc::new(NodeConf {
        network: ldk_node::bitcoin::Network::Testnet,
        seed,
        storage_dir: UserPaths::new().ldk_data_dir(&node_name),
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
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
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
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
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
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return false;
        }
    };
    node.status().is_running
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
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return empty_result;
        }
    };
    match node.onchain_payment().new_address() {
        Ok(a) => a.to_string(),
        Err(e) => {
            dbg!(e);
            return empty_result;
        }
    }
}

#[tauri::command]
pub fn close_channel(node_name: String, node_id: String, user_channel_id: u128) -> bool {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
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
    match node.close_channel(&UserChannelId(user_channel_id), pub_key, false) {
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
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
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
            balance_msat: channel_details.channel_value_sats,
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

// #[tauri::command]
// pub fn list_payments(node_name: String) -> Vec<PaymentDetails> {
//     let node = match NODES.read() {
//         Ok(n) => n,
//         Err(e) => {
//             dbg!(&e);
//             return vec![];
//         }
//     };
//     let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
//         Some(n) => n,
//         None => {
//             dbg!("Unable to get node");
//             return vec![];
//         }
//     };
//     node.list_payments()
// }

#[tauri::command]
pub fn list_channels(node_name: String) -> Vec<ChanDetails> {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return vec![];
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
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
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return None;
        }
    };
    match node
        .bolt11_payment()
        .receive(amount_msat, description, expiry_secs)
    {
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
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
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
    match node.bolt11_payment().send(&invoice) {
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
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
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
    let node = match node.get(&UserPaths::new().ldk_data_dir(&our_node_name)) {
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
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
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
pub fn pay_bolt12_offer(node_name: String, offer: String, amount_msat: u64) -> bool {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return false;
        }
    };
    match node.bolt12_payment().send(
        &Offer::from_str(&offer).unwrap(),
        Some("something".to_string()),
    ) {
        Ok(_) => true,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    }
}

#[tauri::command]
pub fn create_bolt12_offer(node_name: String, note: String) -> String {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            panic!("not able to read nodes list");
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            panic!("not able to get node");
        }
    };

    node.bolt12_payment()
        .receive(10 * 10, &note)
        .unwrap()
        .to_string()
}

#[tauri::command]
pub fn open_channel_with_lsp(node_name: String, amount_msat: u64) -> String {
    let node = match NODES.read() {
        Ok(n) => n,
        Err(e) => {
            dbg!(&e);
            return "".to_string();
        }
    };
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return "".to_string();
        }
    };
    node.bolt11_payment()
        .receive_via_jit_channel(amount_msat, "lspdesc", 120000, None)
        .unwrap()
        .to_string()
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
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return 0;
        }
    };
    node.list_balances().spendable_onchain_balance_sats
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
    let node = match node.get(&UserPaths::new().ldk_data_dir(&node_name)) {
        Some(n) => n,
        None => {
            dbg!("Unable to get node");
            return 0;
        }
    };
    node.list_balances().total_onchain_balance_sats
}

#[tauri::command]
pub fn get_our_address(node_name: String) -> String {
    let config: WalletConfig = match WalletConfig::new(&node_name) {
        Ok(c) => c,
        Err(_) => return "".to_string(),
    };
    return config.get_listening_address();
}

#[tauri::command]
pub fn get_esplora_address(node_name: String) -> String {
    let config: WalletConfig = match WalletConfig::new(&node_name) {
        Ok(c) => c,
        Err(_) => return "".to_string(),
    };
    return config.get_esplora_address();
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct NodeConf {
    pub network: Network,
    pub storage_dir: String,
    pub listening_address: String,
    pub seed: Vec<u8>,
    pub esplora_address: String,
}

lazy_static! {
    static ref NODES: RwLock<HashMap<String, Arc<Node>>> = RwLock::new(HashMap::new());
}

pub fn init_lazy(config: Arc<NodeConf>) -> (bool, String) {
    let storage_dir = config.storage_dir.clone();
    let mut builder = Builder::new();
    builder.set_network(Network::Signet);
    println!("Default Network: Signet");
    builder.set_log_level(LogLevel::Debug);
    builder.set_storage_dir_path(storage_dir.clone());
    builder.set_log_dir_path(format!("{}/logs", &config.storage_dir));
    builder.set_liquidity_source_lsps2(
        SocketAddress::from_str("44.219.111.31:39735").unwrap(),
        PublicKey::from_str("0371d6fd7d75de2d0372d03ea00e8bacdacb50c27d0eaea0a76a0622eff1f5ef2b")
            .unwrap(),
        Some("T2MF3ZU5".to_string()),
    );
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
            thread::spawn(move || loop {
                let event = node.clone().wait_next_event();
                // match event {

                // }
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

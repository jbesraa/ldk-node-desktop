use crate::rpc_client;
use crate::walletrpc::{CloseChannelRequest, GeneralNodeNameRequest, OpenChannelRequest};

pub mod walletrpc {
    tonic::include_proto!("walletrpc");
}

#[tauri::command]
pub async fn start_node(node_name: String) -> (bool, String) {
    let req = GeneralNodeNameRequest {
        node_name: node_name.clone(),
    };
    let res = rpc_client::start_node(req).await.unwrap();
    let res = res.into_inner();
    (res.success, res.msg)
}

#[tauri::command]
pub async fn get_node_id(node_name: String) -> String {
    let req = GeneralNodeNameRequest {
        node_name: node_name.clone(),
    };
    let res = rpc_client::get_node_id(req).await.unwrap();
    res.into_inner().node_id
}

#[tauri::command]
pub async fn stop_node(node_name: String) -> bool {
    let req = GeneralNodeNameRequest {
        node_name: node_name.clone(),
    };
    let res = rpc_client::stop_node(req).await.unwrap();
    res.into_inner().success
}

#[tauri::command]
pub async fn is_node_running(node_name: String) -> bool {
    let req = GeneralNodeNameRequest {
        node_name: node_name.clone(),
    };
    let res = rpc_client::is_node_running(req).await.unwrap();
    res.into_inner().success
}

#[tauri::command]
pub async fn new_onchain_address(node_name: String) -> String {
    let req = GeneralNodeNameRequest {
        node_name: node_name.clone(),
    };
    let res = rpc_client::get_on_chain_address(req).await.unwrap();
    res.into_inner().address
}

#[tauri::command]
pub async fn close_channel(node_name: String, node_id: String, channel_id: String) -> bool {
    let req = CloseChannelRequest {
        our_node_name: node_name.clone(),
        node_id,
        channel_id,
    };
    let res = rpc_client::close_channel(req).await.unwrap();
    res.into_inner().success
}

#[tauri::command]
pub async fn open_channel(
    node_name: String,
    node_id: String,
    net_address: String,
    channel_amount_sats: i64,
    push_to_counterparty_msat: i64,
    announce_channel: bool,
) -> bool {
    let req = OpenChannelRequest {
        our_node_name: node_name.clone(),
        node_id,
        net_address,
        channel_amount_sats,
        push_to_counterparty_msat,
        announce_channel,
    };
    let res = rpc_client::open_channel(req).await.unwrap();
    res.into_inner().success
}

#[tauri::command]
pub async fn total_onchain_balance(node_name: String) -> i64 {
    let req = GeneralNodeNameRequest {
        node_name: node_name.clone(),
    };
    let res = rpc_client::get_on_chain_balance(req).await.unwrap();
    res.into_inner().balance
}

#[tauri::command]
pub async fn get_net_address(node_name: String) -> String {
    let req = GeneralNodeNameRequest {
        node_name: node_name.clone(),
    };
    let res = rpc_client::get_net_address(req).await.unwrap();
    res.into_inner().address
}

#[tauri::command]
pub async fn get_esplora_address(node_name: String) -> String {
    let req = GeneralNodeNameRequest {
        node_name: node_name.clone(),
    };
    let res = rpc_client::get_esplora_address(req).await.unwrap();
    res.into_inner().address
}

// #[tauri::command]
// pub async fn list_channels(node_name: String) -> Vec<ChanDetails> {
//     let req = GeneralNodeNameRequest {
//         node_name: node_name.clone(),
//     };
//     let res = rpc_client::list_channels(req).await.unwrap();
//     let res = res.into_inner();
//     // let mut channels = Vec::new();
//     // for channel in res.channels {
//     //     channels.push(ChanDetails::from(channel));
//     // }
//     res.channels.into_iter().map(|(_, c)| ChanDetails::from(c)).collect()
// }

// #[tauri::command]
// pub fn create_invoice(
//     node_name: String,
//     amount_msat: u64,
//     description: &str,
//     expiry_secs: u32,
// ) -> Option<String> {
// }

// /// returns payment hash if successful
// #[tauri::command]
// pub fn pay_invoice(node_name: String, invoice: String) -> Option<[u8; 32]> {}

// #[tauri::command]
// pub fn disconnect_peer(node_name: String, node_id: String) -> bool {}

// #[tauri::command]
// pub fn connect_to_node(our_node_name: String, node_id: String, net_address: String) -> bool {}

// #[tauri::command]
// pub async fn list_peers(node_name: String) -> Vec<WrappedPeerDetails> {}

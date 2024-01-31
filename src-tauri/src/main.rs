// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_log::LogTarget;
mod lightning;
mod rpc_client;

pub mod walletrpc {
    tonic::include_proto!("walletrpc");
}

fn main() {
    let app = tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::Stdout])
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            lightning::get_node_id,
            lightning::start_node,
            lightning::stop_node,
            lightning::get_net_address,
            // lightning::connect_to_node,
            // lightning::list_peers,
            lightning::new_onchain_address,
            // lightning::disconnect_peer,
            // lightning::list_channels,
            // lightning::create_invoice,
            // lightning::pay_invoice,
            lightning::open_channel,
            lightning::close_channel,
            lightning::total_onchain_balance,
            lightning::is_node_running,
            // lightning::sync_wallet,
            lightning::get_esplora_address,
            // wallet::create_wallet,
            // wallet::update_config,
            // wallet::list_wallets,
            // bitcoin::list_wallets,
            // bitcoin::load_wallet,
            // bitcoin::get_new_address,
            // bitcoin::create_transaction,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, e| match e {
        tauri::RunEvent::ExitRequested { api, .. } => {
            api.prevent_exit();
        }
        _ => {}
    })
}

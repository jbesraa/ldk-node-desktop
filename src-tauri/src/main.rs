// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_log::LogTarget;
mod lightning;

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::Stdout])
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            lightning::get_node_id,
            lightning::start_node,
            lightning::stop_node,
            lightning::spendable_on_chain,
            lightning::get_our_address,
            lightning::connect_to_node,
            lightning::list_peers,
            lightning::new_onchain_address,
            lightning::disconnect_peer,
            lightning::list_channels,
            lightning::create_invoice,
            lightning::pay_invoice,
            lightning::open_channel,
            lightning::close_channel,
            lightning::total_onchain_balance,
            lightning::is_node_running,
            lightning::sync_wallet,
            lightning::list_payments,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

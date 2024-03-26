// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_log::LogTarget;
#[macro_use]
extern crate lazy_static;
mod account;
mod bitcoin;
mod lightning;
mod paths;
mod wallet;

use actix_web::{web, App, HttpResponse, HttpServer, Responder};

async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

fn main() {
    let app = tauri::Builder::default()
        .setup(|app| {
            tauri::async_runtime::spawn(
                HttpServer::new(|| {
                    App::new()
                        .route("/", web::get().to(hello))
                        .route("/balance", web::get().to(lightning::get_account_balance))
                        .route("/offer", web::get().to(lightning::get_account_offer))
                        .route("/offer", web::post().to(lightning::pay_account_offer))
                })
                .bind(("127.0.0.1", 8283))?
                .run(),
            );
            Ok(())
        })
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
            lightning::open_channel_with_lsp,
            // lightning::sync_wallet,
            // lightning::list_payments,
            lightning::get_esplora_address,
            lightning::pay_bolt12_offer,
            lightning::create_bolt12_offer,
            wallet::create_wallet,
            wallet::update_config,
            wallet::list_wallets,
            // bitcoin::list_wallets,
            // bitcoin::load_wallet,
            // bitcoin::get_new_address,
            // bitcoin::create_transaction,
            account::create_account
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

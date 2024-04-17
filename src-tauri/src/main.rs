// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::AppHandle;

mod barcode_handler;
mod errors;
mod img;
mod pdf_handler;
mod scanned_document;
mod utils;

#[tauri::command]
async fn generate_pdfs_from_sources(
  sources: Vec<String>,
  target: String,
  reference: Box<str>,
  app_handle: AppHandle,
) {
  pdf_handler::generate_pdfs_from_sources(sources, target, reference, &app_handle)
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![generate_pdfs_from_sources])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

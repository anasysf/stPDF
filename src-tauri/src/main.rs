// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use pdf::Pdf;
use tauri::AppHandle;

mod img;
mod pdf;
mod scanner;
mod scanner_old;
mod utils;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn generate_pdf(
  app_handle: AppHandle,
  source_path: String,
  target_path: String,
  reference: String,
) {
  // Scanner::generate_pdf(source_path, target_path, reference)
  scanner_old::ui::generate_pdf(app_handle, source_path, target_path, reference)
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let pdf = Pdf::new(
        "C:\\Users\\anayo\\Pictures\\2024-03-22\\001.png",
        "C:\\Users\\anayo\\Pictures\\pdfs",
        "666",
      );
      pdf.generate_pdf(app.handle()).unwrap();
      Ok(())
    })
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![greet, generate_pdf])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

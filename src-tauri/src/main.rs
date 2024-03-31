// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use scanner::Scanner;

mod scanner;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
  let files = Scanner::walk_dir(".").expect("COULD NOT READ DIRECTORY");
  for file in files {
    println!("DECODING: {file:#?}");

    let result = Scanner::decode_barcode_code_128(file).expect("COULD NOT DECODE IMAGE");
    println!("{} => {}", result.getBarcodeFormat(), result.getText());
  }

  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![greet])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

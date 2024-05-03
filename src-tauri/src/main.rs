// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use pdf_document::document::Document;
use tauri::AppHandle;

use crate::analyzed_document::AnalyzedDocument;

mod analyzed_document;
mod barcode_handler;
mod errors;
mod img;
mod pdf_document;
mod utils;

#[tauri::command]
async fn analyze_sources(sources: Vec<Box<str>>, app_handle: AppHandle) -> Vec<AnalyzedDocument> {
    AnalyzedDocument::analyze_sources(&app_handle, sources)
}

#[tauri::command]
async fn generate_pdfs(
    app_handle: AppHandle,
    analyzed_documents: Vec<AnalyzedDocument>,
    target_directory: Box<str>,
    reference: Box<str>,
) {
    let docs = Document::from_analyzed_documents(analyzed_documents);
    Document::generate_pdfs(app_handle, docs, target_directory, reference)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![analyze_sources, generate_pdfs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

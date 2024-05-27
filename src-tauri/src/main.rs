// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use analyzed_document::AnalyzedDocument;
use pdf_document::document::Document;
use registries::options_registry::OptionsRegistry;
use state::AppState;
use tauri::{AppHandle, State};

mod analyzed_document;
mod errors;
mod excel_document;
mod identifier_handler;
mod pdf_document;
mod registries;
mod state;
mod utils;

#[tauri::command]
async fn analyze_sources(
    app_handle: AppHandle,
    state: State<'_, AppState>,
    options_registry: OptionsRegistry<'_, String>,
) -> Result<Vec<AnalyzedDocument<String>>, ()> {
    Ok(AnalyzedDocument::analyze_sources(app_handle, state, options_registry).into_vec())
}

#[tauri::command]
async fn generate_pdfs(
    app_handle: AppHandle,
    state: State<'_, AppState>,
    analyzed_documents: Vec<AnalyzedDocument<String>>,
    options_registry: OptionsRegistry<'_, String>,
) -> Result<(), ()> {
    let docs = Document::from_analyzed_documents(&state, analyzed_documents);
    Document::generate_pdfs(app_handle, state, docs, &options_registry);

    Ok(())
}

#[tauri::command]
async fn clear_state(state: State<'_, AppState>) -> Result<(), ()> {
    let mut app_state_guard = state.lock().unwrap();
    app_state_guard.dynamic_document_map.clear();
    app_state_guard.pdf_pages_map.clear();

    Ok(())
}

#[tauri::command]
async fn generate_excel(
    state: State<'_, AppState>,
    options_registry: OptionsRegistry<'_, String>,
) -> Result<(), ()> {
    excel_document::generate_excel(state, options_registry);

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(AppState::default())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            analyze_sources,
            generate_pdfs,
            clear_state,
            generate_excel
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

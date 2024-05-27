use std::{fmt::Display, path::Path};

use tauri::State;
use xlsxwriter::Workbook;

use crate::{registries::options_registry::OptionsRegistry, state::AppState};

pub fn generate_excel<P: AsRef<Path> + Clone + Display + Send + Sync>(
    state: State<AppState>,
    options_registry: OptionsRegistry<P>,
) {
    let excel_filename =
        format!("{}/BJA_CONTRAT {}.xlsx", options_registry.target_dir, options_registry.reference);
    let workbook = Workbook::new(&excel_filename).unwrap();

    let mut worksheet = workbook.add_worksheet(None).unwrap();

    let app_state_guard = state.lock().unwrap();

    app_state_guard.pdf_pages_map.iter().enumerate().for_each(|(idx, (path, pages_count))| {
        let path_filename = path.file_name().unwrap();
        let file_stem = path.file_stem().unwrap();
        let split_path_filename = file_stem.to_str().unwrap().split('_').collect::<Vec<&str>>();
        let id_police = split_path_filename[0];
        let reference = split_path_filename[1];

        worksheet.write_string(idx as u32, 0, id_police, None).unwrap();
        worksheet.write_string(idx as u32, 1, path_filename.to_str().unwrap(), None).unwrap();
        worksheet.write_string(idx as u32, 2, reference, None).unwrap();
        worksheet.write_number(idx as u32, 3, *pages_count as f64, None).unwrap();
    });

    workbook.close().unwrap();
}

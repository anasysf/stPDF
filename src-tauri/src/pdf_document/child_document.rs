use std::{ffi::OsStr, fmt::Display, path::Path};

use image::DynamicImage;
use tauri::State;

use crate::{analyzed_document::AnalyzedDocument, state::AppState};

pub struct ChildDocument {
    pub file_name: Box<OsStr>,
    pub dynamic_image: DynamicImage,
}

impl ChildDocument {
    pub fn new(file_name: Box<OsStr>, dynamic_image: DynamicImage) -> Self {
        Self { file_name, dynamic_image }
    }

    pub fn from_analyzed_docs<P: AsRef<Path> + Clone + Display + Send + Sync>(
        state: &State<AppState>,
        analyzed_document: AnalyzedDocument<P>,
    ) -> Self {
        let app_state_guard = state.lock().unwrap();
        let dynamic_image = app_state_guard
            .dynamic_document_map
            .get(analyzed_document.metadata.image_path.as_ref());

        Self::new(analyzed_document.metadata.file_name, dynamic_image.unwrap().to_owned())
    }
}

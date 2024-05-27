use std::{ffi::OsStr, fmt::Display, path::Path};

use image::DynamicImage;
use tauri::State;

use crate::{analyzed_document::AnalyzedDocument, state::AppState};

use super::child_document::ChildDocument;

pub struct ParentDocument {
    pub identifier: Box<str>,
    pub file_name: Box<OsStr>,
    pub children: Vec<ChildDocument>,
    pub dynamic_image: DynamicImage,
}

impl ParentDocument {
    pub fn new(
        identifier: Box<str>,
        file_name: Box<OsStr>,
        children: Vec<ChildDocument>,
        dynamic_image: DynamicImage,
    ) -> Self {
        Self { identifier, file_name, children, dynamic_image }
    }

    pub fn from_analyzed_docs<P: AsRef<Path> + Clone + Display + Send + Sync>(
        state: &State<AppState>,
        analyzed_document: AnalyzedDocument<P>,
    ) -> Self {
        let app_state_guard = state.lock().unwrap();
        let dynamic_image = app_state_guard
            .dynamic_document_map
            .get(analyzed_document.metadata.image_path.as_ref());

        Self::new(
            analyzed_document.identifier.unwrap(),
            analyzed_document.metadata.file_name,
            vec![],
            dynamic_image.unwrap().to_owned(),
        )
    }
}

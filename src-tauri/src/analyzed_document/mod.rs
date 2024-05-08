use std::ffi::OsStr;

use rayon::iter::{IndexedParallelIterator, IntoParallelRefIterator, ParallelIterator};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, EventTarget, Manager};

use crate::{barcode_handler, img::DecodedImage};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AnalyzedDocument {
    pub(crate) identifier: Option<String>,
    pub(crate) image_path: Box<str>,
    pub(crate) file_name: String,
    is_included: bool,
}

impl AnalyzedDocument {
    fn new(
        identifier: Option<String>,
        image_path: Box<str>,
        file_name: String,
        is_included: bool,
    ) -> Self {
        Self { identifier, image_path, file_name, is_included }
    }

    pub(crate) fn analyze_sources(app_handle: &AppHandle, sources: Vec<Box<str>>) -> Vec<Self> {
        app_handle.emit_to(EventTarget::App, "started-analyzing-sources", sources.len()).unwrap();

        DecodedImage::decode_dynamic_images(app_handle, sources)
            .par_iter()
            .enumerate()
            .map(|(idx, decoded_image)| {
                app_handle.emit_to(EventTarget::App, "current-source", idx + 1).unwrap();

                let identifier: Option<String> = if let Ok(result) =
                    barcode_handler::decode_barcode_code_128(&decoded_image.dynamic_image)
                {
                    Some(result.getText().into())
                } else {
                    None
                };

                AnalyzedDocument::new(
                    identifier,
                    decoded_image.path.display().to_string().into(),
                    decoded_image
                        .path
                        .file_name()
                        .unwrap_or(OsStr::new("UNKNOWN"))
                        .to_str()
                        .unwrap_or("UNKNOWN")
                        .into(),
                    true,
                )
            })
            .collect::<Vec<Self>>()
    }
}

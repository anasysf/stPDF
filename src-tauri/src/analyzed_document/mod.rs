use std::ffi::OsStr;

use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

use crate::{barcode_handler, img::DecodedImage};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AnalyzedDocument {
    pub(crate) identifier: Option<Box<str>>,
    pub(crate) image_path: Box<str>,
    pub(crate) file_name: Box<str>,
    is_included: bool,
}

impl AnalyzedDocument {
    fn new(
        identifier: Option<Box<str>>,
        image_path: Box<str>,
        file_name: Box<str>,
        is_included: bool,
    ) -> Self {
        Self { identifier, image_path, file_name, is_included }
    }

    pub(crate) fn analyze_sources(app_handle: &AppHandle, sources: Vec<Box<str>>) -> Vec<Self> {
        DecodedImage::decode_dynamic_images(app_handle, sources)
            .par_iter()
            .map(|decoded_image| {
                match barcode_handler::decode_barcode_code_128(&decoded_image.dynamic_image) {
                    Ok(result) => AnalyzedDocument::new(
                        Some(result.getText().into()),
                        decoded_image.path.display().to_string().into(),
                        decoded_image
                            .path
                            .file_name()
                            .unwrap_or(OsStr::new("UNKNOWN"))
                            .to_str()
                            .unwrap_or("UNKNOWN")
                            .into(),
                        true,
                    ),
                    Err(_) => AnalyzedDocument::new(
                        None,
                        decoded_image.path.display().to_string().into(),
                        decoded_image
                            .path
                            .file_name()
                            .unwrap_or(OsStr::new("UNKNOWN"))
                            .to_str()
                            .unwrap_or("UNKNOWN")
                            .into(),
                        true,
                    ),
                }
            })
            .collect::<Vec<Self>>()
    }
}

use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use serde::Serialize;
use tauri::AppHandle;

use crate::{barcode_handler, img::DecodedImage};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AnalyzedDocument {
    identifier: Option<Box<str>>,
    image_path: Box<str>,
}

impl AnalyzedDocument {
    fn new(identifier: Option<Box<str>>, image_path: Box<str>) -> Self {
        Self { identifier, image_path }
    }

    pub(crate) fn analyze_sources(app_handle: &AppHandle, sources: Vec<Box<str>>) -> Vec<Self> {
        DecodedImage::decode_dynamic_images(app_handle, sources)
            .par_iter()
            .map(|decoded_image| {
                match barcode_handler::decode_barcode_code_128(&decoded_image.dynamic_image) {
                    Ok(result) => AnalyzedDocument::new(
                        Some(result.getText().into()),
                        decoded_image.path.display().to_string().into(),
                    ),
                    Err(_) => {
                        AnalyzedDocument::new(None, decoded_image.path.display().to_string().into())
                    }
                }
            })
            .collect::<Vec<Self>>()
    }
}

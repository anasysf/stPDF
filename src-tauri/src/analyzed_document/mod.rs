use std::{ffi::OsStr, path::Path};

use image::{imageops::FilterType, DynamicImage};
use rayon::iter::{IndexedParallelIterator, IntoParallelRefIterator, ParallelIterator};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, EventTarget, Manager};

use crate::{barcode_handler, img::{DecodedImage, DecodedImages}, registries::options_registry::OptionsRegistry};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AnalyzedDocuments<P: AsRef<Path> + Clone> {
    identifier: Option<Box<str>>,
    image_path: Box<P>,
    file_name: Box<OsStr>,
    is_included: bool,
}

impl<P: AsRef<Path> + Clone> AnalyzedDocuments<P> {
    pub(crate) fn new(
        identifier: Option<Box<str>>,
        image_path: Box<P>,
        file_name: Box<OsStr>,
        is_included: bool,
    ) -> Self {
        Self { identifier, image_path, file_name, is_included }
    }

    pub(crate) fn analyze_sources(
        app_handle: &AppHandle,
        options_registry: OptionsRegistry<P>,
    ) -> Box<[Self]> {
        app_handle
            .emit_to(EventTarget::App, "started-analyzing-sources", options_registry.sources.len())
            .ok();

        DecodedImages::to_decoded_images(options_registry)
            .iter()
            .map(|decoded_image| {
                let compressed_image = decoded_image.compress(FilterType::Nearest);

                let identifier = if let Ok(result) = barcode_handler::decode_barcode_code_128(&DynamicImage::from(compressed_image)) {
                    Some(result.getText())
                } else {
                    None
                }

                Self::new(identifier, decoded_image.path, de, is_included)
            })
            .collect()
    }
}

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

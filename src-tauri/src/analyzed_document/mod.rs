use std::{ffi::OsStr, fmt::Display, path::Path};

use image::DynamicImage;
use rayon::iter::{IndexedParallelIterator, IntoParallelRefIterator, ParallelIterator};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, EventTarget, Manager};

use crate::{
    identifier_handler, img::DecodedImage, registries::options_registry::OptionsRegistry, utils,
};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyzedDocument<P: AsRef<Path> + Clone + Display + Send + Sync> {
    pub identifier: Option<Box<str>>,
    is_included: bool,
    pub metadata: DocumentMetadata<P>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentMetadata<P: AsRef<Path> + Clone + Display + Send + Sync> {
    pub image_path: P,
    pub file_name: Box<OsStr>,
    size: u64,
}

impl<P: AsRef<Path> + Clone + Display + Send + Sync> DocumentMetadata<P> {
    fn new(image_path: P, file_name: Box<OsStr>, size: u64) -> Self {
        Self { image_path, file_name, size }
    }
}

impl<P: AsRef<Path> + Clone + Display + Send + Sync> AnalyzedDocument<P> {
    pub fn new(
        identifier: Option<Box<str>>,
        is_included: bool,
        metadata: DocumentMetadata<P>,
    ) -> Self {
        Self { identifier, is_included, metadata }
    }

    pub fn analyze_sources(
        app_handle: AppHandle,
        options_registry: OptionsRegistry<P>,
    ) -> Box<[Self]> {
        app_handle
            .emit_to(EventTarget::App, "started-analyzing-sources", options_registry.sources.len())
            .ok();

        DecodedImage::to_decoded_images(&options_registry)
            .par_iter()
            .enumerate()
            .map(|(idx, decoded_image)| {
                app_handle.emit_to(EventTarget::App, "current-source", idx).ok();

                let identifier = if let Ok(result) = identifier_handler::decode_identifier(
                    &DynamicImage::from(decoded_image.sub_image.clone()),
                    &options_registry,
                ) {
                    Some(result.getText().into())
                } else {
                    None
                };

                // File size in bytes.
                let size_bytes = decoded_image.path.as_ref().metadata().unwrap().len();
                let size_mb = utils::bytes_to_mb(size_bytes);

                Self::new(
                    identifier,
                    true,
                    DocumentMetadata::new(
                        decoded_image.path.clone(),
                        decoded_image
                            .path
                            .as_ref()
                            .file_name()
                            .unwrap_or(OsStr::new("UNKNOWN"))
                            .into(),
                        size_mb,
                    ),
                )
            })
            .collect()
    }
}

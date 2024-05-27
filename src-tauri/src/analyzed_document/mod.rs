use std::{
    ffi::OsStr,
    fmt::Display,
    path::Path,
    sync::{Arc, Mutex},
};

use human_bytes::human_bytes;
use image::{DynamicImage, GenericImageView};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, EventTarget, Manager, State};

use crate::{identifier_handler, registries::options_registry::OptionsRegistry, state::AppState};

use self::metadata::DocumentMetadata;

mod metadata;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyzedDocument<P: AsRef<Path> + Clone + Display + Send + Sync> {
    pub identifier: Option<Box<str>>,
    is_included: bool,
    pub metadata: DocumentMetadata<P>,
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
        state: State<AppState>,
        options_registry: OptionsRegistry<P>,
    ) -> Box<[Self]> {
        app_handle
            .emit_to(EventTarget::App, "started-analyzing-sources", options_registry.sources.len())
            .ok();

        if options_registry.sources.len() <= 20 {
            Self::analyze_sources_seq(app_handle, state, options_registry)
        } else {
            Self::analyze_sources_par(app_handle, state, options_registry)
        }
    }

    fn analyze_sources_par(
        app_handle: AppHandle,
        state: State<AppState>,
        options_registry: OptionsRegistry<P>,
    ) -> Box<[Self]> {
        let count = Arc::new(Mutex::new(0u64));

        options_registry
            .sources
            .par_iter()
            .inspect(|_| *count.lock().unwrap() += 1)
            .filter_map(|source| {
                app_handle.emit_to(EventTarget::App, "current-source", *count.lock().unwrap()).ok();

                match image::open(source) {
                    Ok(image) => {
                        let (width, height) = image.dimensions();
                        let sub_image = image.view(0, 0, width, height / 10);
                        let dynamic_sub_image = DynamicImage::from(sub_image.to_image());

                        let identifier = if let Ok(result) = identifier_handler::decode_identifier(
                            &dynamic_sub_image,
                            &options_registry,
                        ) {
                            Some(result.getText().into())
                        } else {
                            None
                        };

                        // File size in bytes.
                        let size_bytes = source.as_ref().metadata().unwrap().len();

                        let metadata = DocumentMetadata::new(
                            source.to_owned(),
                            source.as_ref().file_name().unwrap_or(OsStr::new("UNKNOWN")).into(),
                            human_bytes(size_bytes as f64).into(),
                        );

                        state
                            .lock()
                            .unwrap()
                            .dynamic_document_map
                            .insert(metadata.image_path.as_ref().to_path_buf(), image);

                        Some(Self::new(identifier, true, metadata))
                    }
                    Err(err) => {
                        eprintln!("{err:#?}");
                        None
                    }
                }
            })
            .collect()
    }

    fn analyze_sources_seq(
        app_handle: AppHandle,
        state: State<AppState>,
        options_registry: OptionsRegistry<P>,
    ) -> Box<[Self]> {
        let count = Arc::new(Mutex::new(0u64));

        options_registry
            .sources
            .iter()
            .inspect(|_| *count.lock().unwrap() += 1)
            .filter_map(|source| {
                app_handle.emit_to(EventTarget::App, "current-source", *count.lock().unwrap()).ok();

                match image::open(source) {
                    Ok(image) => {
                        let (width, height) = image.dimensions();
                        let sub_image = image.view(0, 0, width, height / 10);
                        let dynamic_sub_image = DynamicImage::from(sub_image.to_image());

                        let identifier = if let Ok(result) = identifier_handler::decode_identifier(
                            &dynamic_sub_image,
                            &options_registry,
                        ) {
                            Some(result.getText().into())
                        } else {
                            None
                        };

                        // File size in bytes.
                        let size_bytes = source.as_ref().metadata().unwrap().len();

                        let metadata = DocumentMetadata::new(
                            source.to_owned(),
                            source.as_ref().file_name().unwrap_or(OsStr::new("UNKNOWN")).into(),
                            human_bytes(size_bytes as f64).into(),
                        );

                        state
                            .lock()
                            .unwrap()
                            .dynamic_document_map
                            .insert(metadata.image_path.as_ref().to_path_buf(), image);

                        Some(Self::new(identifier, true, metadata))
                    }
                    Err(err) => {
                        eprintln!("{err:#?}");
                        None
                    }
                }
            })
            .collect()
    }
}

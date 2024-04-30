use std::{fmt::Debug, path::PathBuf};

use image::{DynamicImage, GenericImageView};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use serde::Serialize;
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize)]
pub(crate) struct DecodedImage {
    pub(crate) path: PathBuf,
    #[serde(skip_serializing)]
    pub(crate) dynamic_image: DynamicImage,
}

impl Debug for DecodedImage {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("DecodedImage").field("path", &self.path).finish()
    }
}

impl DecodedImage {
    fn new(path: PathBuf, dynamic_image: DynamicImage) -> Self {
        Self { path, dynamic_image }
    }

    pub(crate) fn decode_dynamic_images(
        app_handle: &AppHandle,
        sources: Vec<Box<str>>,
    ) -> Vec<Self> {
        sources
            .par_iter()
            .filter_map(|source| match image::open(source.to_string()) {
                Ok(dynamic_image) => {
                    let (width, height) = dynamic_image.dimensions();
                    let sub_image = dynamic_image.view(0, 0, width, height / 10);
                    let dynamic_image = DynamicImage::ImageRgba8(sub_image.to_image());

                    Some(Self::new(PathBuf::from(source.to_string()), dynamic_image))
                }
                Err(err) => {
                    app_handle
                        .dialog()
                        .message(err.to_string())
                        .title("Oops..! Error analyzing image...")
                        .blocking_show();
                    None
                }
            })
            .collect::<Vec<_>>()
    }
}

use std::{
  fs,
  path::{Path, PathBuf},
};

use image::DynamicImage;
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use serde::Serialize;
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

use crate::errors::ScannerResult;

#[derive(Serialize)]
pub(crate) struct DecodedImage {
  pub(crate) path: PathBuf,
  #[serde(skip_serializing)]
  pub(crate) dynamic_image: DynamicImage,
}

impl DecodedImage {
  fn new(path: PathBuf, dynamic_image: DynamicImage) -> Self {
    Self {
      path,
      dynamic_image,
    }
  }

  pub(crate) fn decode_dynamic_image<P: AsRef<Path>>(image_path: P) -> ScannerResult<DynamicImage> {
    Ok(image::load_from_memory(&fs::read(image_path)?)?)
  }

  pub(crate) fn decode_dynamic_images(app_handle: &AppHandle, sources: Vec<Box<str>>) -> Vec<Self> {
    sources
      .par_iter()
      .filter_map(
        |source| match Self::decode_dynamic_image(source.to_string()) {
          Ok(dynamic_image) => Some(Self::new(PathBuf::from(source.to_string()), dynamic_image)),
          Err(err) => {
            app_handle
              .dialog()
              .message(err.to_string())
              .title("Oops..! Error analyzing image...")
              .blocking_show();
            None
          }
        },
      )
      .collect::<Vec<_>>()
  }
}

use std::{fs, path::Path};

use image::DynamicImage;

use crate::errors::ScannerResult;

pub fn decode_dynamic_image<P: AsRef<Path>>(image_path: P) -> ScannerResult<DynamicImage> {
  let buffer = fs::read(image_path)?;

  Ok(image::load_from_memory(&buffer)?)
}

use std::{
  collections::HashSet,
  ffi::OsStr,
  fs,
  io::{self, BufReader, Cursor},
  path::{Path, PathBuf},
};

use image::{io::Reader as ImageReader, DynamicImage, ImageResult};

use crate::scanner::errors::ScannerResult;

pub fn read_dir<P: AsRef<Path>>(
  path: P,
  extensions: Option<HashSet<&str>>,
) -> ScannerResult<HashSet<PathBuf>> {
  let extensions = extensions.unwrap_or(HashSet::from(["png", "jpeg", "jpg"]));
  Ok(
    fs::read_dir(path)?
      .filter_map(|res| {
        res.ok().and_then(|dir_entry| {
          let path = dir_entry.path();
          if path.is_file()
            && extensions.contains(
              path
                .extension()
                .unwrap_or(OsStr::new(""))
                .to_str()
                .unwrap_or(""),
            )
          {
            Some(path)
          } else {
            None
          }
        })
      })
      .collect(),
  )
}

pub fn convert_px_to_mm(px: f32, dpi: Option<f32>) -> f32 {
  const INCH_TO_CM: f32 = 25.4f32;
  let dpi = dpi.unwrap_or(300f32);

  px * (INCH_TO_CM / dpi)
}

pub fn walk_dir_old<P: AsRef<Path>>(path: P) -> io::Result<Vec<PathBuf>> {
  Ok(
    fs::read_dir(path)?
      .filter_map(|res| {
        res.ok().and_then(|dir_entry| {
          let path = dir_entry.path();
          if path.is_file() {
            Some(path)
          } else {
            None
          }
        })
      })
      .collect(),
  )
}

pub fn decode_image<P: AsRef<Path>>(path: P) -> ImageResult<DynamicImage> {
  let image_buffer = fs::read(path).expect("COULD NOT READ IMAGE");
  let reader = ImageReader::new(BufReader::new(Cursor::new(image_buffer)))
    .with_guessed_format()
    .expect("COULD NOT GUESS FORMAT");

  reader.decode()
}

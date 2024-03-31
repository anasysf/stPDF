use std::{
  fs,
  io::{self, Cursor},
  path::{Path, PathBuf},
};

use image::io::Reader as ImageReader;
use rxing::{
  common::HybridBinarizer, oned::Code128Reader, BinaryBitmap, BufferedImageLuminanceSource,
  Exceptions, RXingResult, Reader,
};

pub struct Scanner;

impl Scanner {
  pub fn walk_dir<P: AsRef<Path>>(path: P) -> io::Result<Vec<PathBuf>> {
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

  pub fn decode_barcode_code_128<P: AsRef<Path>>(path: P) -> Result<RXingResult, Exceptions> {
    let image_buffer = fs::read(path).expect("COULD NOT READ IMAGE");
    let reader = ImageReader::new(Cursor::new(image_buffer))
      .with_guessed_format()
      .expect("COULD NOT GUESS THE FORMAT");
    let img = reader.decode().expect("COULD NOT DECODE IMAGE");

    let source = BufferedImageLuminanceSource::new(img);
    let binarizer = HybridBinarizer::new(source);
    let mut binary_bitmap = BinaryBitmap::new(binarizer);

    Code128Reader.decode(&mut binary_bitmap)
  }
}

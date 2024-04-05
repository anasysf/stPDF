use std::io::{BufReader, Cursor};

use image::{io::Reader as ImageReader, DynamicImage};

use crate::scanner::errors::ScannerResult;

pub fn decode_image(inner: Vec<u8>) -> ScannerResult<DynamicImage> {
  Ok(
    ImageReader::new(BufReader::new(Cursor::new(inner)))
      .with_guessed_format()?
      .decode()?,
  )
}

use std::collections::{HashMap, HashSet};

use image::DynamicImage;
use rxing::{
  common::HybridBinarizer, oned::Code128Reader, BarcodeFormat, BinaryBitmap,
  BufferedImageLuminanceSource, DecodeHintType, DecodeHintValue, Reader,
};

use self::{barcode_128::Barcode128, errors::ScannerResult};

mod barcode_128;
pub mod errors;

pub fn scan_code_128_image(img: &DynamicImage) -> ScannerResult<Barcode128> {
  let mut image = BinaryBitmap::new(HybridBinarizer::new(BufferedImageLuminanceSource::new(
    img.clone(),
  )));

  let hints = HashMap::from([
    (
      DecodeHintType::POSSIBLE_FORMATS,
      DecodeHintValue::PossibleFormats(HashSet::from([BarcodeFormat::CODE_128])),
    ),
    (DecodeHintType::TRY_HARDER, DecodeHintValue::TryHarder(true)),
  ]);

  Ok(Barcode128::new(
    Code128Reader.decode_with_hints(&mut image, &hints)?,
    img.clone(),
  ))
}

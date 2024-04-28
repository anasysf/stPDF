use std::collections::{HashMap, HashSet};

use image::DynamicImage;
use rxing::{
    common::HybridBinarizer, oned::Code128Reader, BarcodeFormat, BinaryBitmap,
    BufferedImageLuminanceSource, DecodeHintType, DecodeHintValue, RXingResult, Reader,
};

use crate::errors::ScannerResult;

pub(crate) fn decode_barcode_code_128(image: &DynamicImage) -> ScannerResult<RXingResult> {
    let hints = HashMap::from([
        (
            DecodeHintType::POSSIBLE_FORMATS,
            DecodeHintValue::PossibleFormats(HashSet::from([BarcodeFormat::CODE_128])),
        ),
        (DecodeHintType::TRY_HARDER, DecodeHintValue::TryHarder(true)),
    ]);

    let source = BufferedImageLuminanceSource::new(image.clone());
    let binarizer = HybridBinarizer::new(source);
    let mut binary_bitmap = BinaryBitmap::new(binarizer);

    Ok(Code128Reader.decode_with_hints(&mut binary_bitmap, &hints)?)
}

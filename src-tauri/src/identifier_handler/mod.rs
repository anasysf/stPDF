use std::{
    collections::{HashMap, HashSet},
    fmt::Display,
    path::Path,
};

use image::DynamicImage;
use rxing::{
    common::HybridBinarizer, oned::Code128Reader, qrcode::cpp_port::QrReader, BarcodeFormat,
    BinaryBitmap, BufferedImageLuminanceSource, DecodeHintType, DecodeHintValue, RXingResult,
    Reader,
};

use crate::{
    errors::ScannerResult,
    registries::options_registry::{IdentifierType, OptionsRegistry},
};

pub fn decode_identifier<P: AsRef<Path> + Clone + Display + Send + Sync>(
    image: &DynamicImage,
    options_registry: &OptionsRegistry<P>,
) -> ScannerResult<RXingResult> {
    match options_registry.identifier_type {
        IdentifierType::Code128 => decode_code_128(image),
        IdentifierType::QrCode => decode_qr_code(image),
    }
}

fn decode_code_128(image: &DynamicImage) -> ScannerResult<RXingResult> {
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

fn decode_qr_code(image: &DynamicImage) -> ScannerResult<RXingResult> {
    let hints = HashMap::from([
        (
            DecodeHintType::POSSIBLE_FORMATS,
            DecodeHintValue::PossibleFormats(HashSet::from([BarcodeFormat::QR_CODE])),
        ),
        (DecodeHintType::TRY_HARDER, DecodeHintValue::TryHarder(true)),
    ]);

    let source = BufferedImageLuminanceSource::new(image.clone());
    let binarizer = HybridBinarizer::new(source);
    let mut binary_bitmap = BinaryBitmap::new(binarizer);

    Ok(QrReader.decode_with_hints(&mut binary_bitmap, &hints)?)
}

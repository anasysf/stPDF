pub mod ui;

use std::{
  collections::{HashMap, HashSet},
  fs::File,
  io::BufWriter,
  path::{Path, PathBuf},
};

use image::DynamicImage;
use printpdf::{
  Image, ImageTransform, Mm, PdfDocument, PdfDocumentReference, PdfLayerIndex, PdfPageIndex,
};
use rxing::{
  common::HybridBinarizer, oned::Code128Reader, BarcodeFormat, BinaryBitmap,
  BufferedImageLuminanceSource, DecodeHintType, DecodeHintValue, Exceptions, RXingResult, Reader,
};

use crate::utils;

pub struct Scanner;

struct PDFDocument {
  document_reference: PdfDocumentReference,
  page_index: PdfPageIndex,
  layer_index: PdfLayerIndex,
}

impl PDFDocument {
  fn new(
    document_reference: PdfDocumentReference,
    page_index: PdfPageIndex,
    layer_index: PdfLayerIndex,
  ) -> Self {
    Self {
      document_reference,
      page_index,
      layer_index,
    }
  }
}

struct PDFResult {
  document: PDFDocument,
  id: String,
  reference: String,
  image: DynamicImage,
  joints: Vec<DynamicImage>,
}

impl PDFResult {
  fn new<S: Into<String>>(
    document: PDFDocument,
    id: S,
    reference: String,
    image: DynamicImage,
    joints: Vec<DynamicImage>,
  ) -> PDFResult {
    PDFResult {
      document,
      id: id.into(),
      reference,
      image,
      joints,
    }
  }
}

impl Scanner {
  fn decode_barcode_code_128(img: DynamicImage) -> Result<RXingResult, Exceptions> {
    let source = BufferedImageLuminanceSource::new(img);
    let binarizer = HybridBinarizer::new(source);
    let mut binary_bitmap = BinaryBitmap::new(binarizer);

    let hints = HashMap::from([
      (
        DecodeHintType::POSSIBLE_FORMATS,
        DecodeHintValue::PossibleFormats(HashSet::from([BarcodeFormat::CODE_128])),
      ),
      (DecodeHintType::TRY_HARDER, DecodeHintValue::TryHarder(true)),
    ]);

    Code128Reader.decode_with_hints(&mut binary_bitmap, &hints)
  }

  pub fn generate_pdf<P: AsRef<Path>>(source_path: P, target_path: P, reference: String) {
    let files = utils::walk_dir_old(source_path).expect("COULD NOT READ DIRECTORY.");

    let mut results: Vec<PDFResult> = Vec::new();

    for file in files {
      let img = utils::decode_image(&file).expect("COULD NOT DECODE IMAGE");

      match Self::decode_barcode_code_128(img.clone()) {
        Ok(result) => {
          let (doc, initial_page, initial_layer) =
            PdfDocument::new("PDF Document", Mm(210.), Mm(297.), "Initial Layer");

          let document = PDFDocument::new(doc, initial_page, initial_layer);
          let result = PDFResult::new(
            document,
            result.getText(),
            reference.clone(),
            img.clone(),
            vec![],
          );

          results.push(result);
        }
        Err(_) => {
          // TODO: HANDLE BETTER IF FIRST RESULT.
          let result = results.last_mut().expect("RESULTS ARE EMPTY");

          let joints = &mut result.joints;
          joints.push(img.clone());
        }
      }
    }

    for result in results {
      let document = result.document;
      let page_index = document.page_index;
      let layer_index = document.layer_index;
      let document_reference = document.document_reference;

      let current_layer = document_reference
        .get_page(page_index)
        .get_layer(layer_index);

      let img = Image::from_dynamic_image(&result.image);
      img.add_to_layer(current_layer, ImageTransform::default());

      let joints = &result.joints;

      if !joints.is_empty() {
        let imgs = joints
          .iter()
          .map(Image::from_dynamic_image)
          .collect::<Vec<_>>();

        for img in imgs {
          let current_layer = {
            let (new_page, new_layer) =
              document_reference.add_page(Mm(210.), Mm(297.), "Initial Layer");
            document_reference.get_page(new_page).get_layer(new_layer)
          };

          img.add_to_layer(
            current_layer,
            ImageTransform {
              translate_x: Some(Mm(210.)),
              translate_y: Some(Mm(297.)),
              rotate: None,
              ..Default::default()
            },
          );
        }
      }

      let file_name = format!("{}_{reference}.pdf", result.id);
      let path = PathBuf::from(target_path.as_ref()).join(file_name);
      let file = File::create(path).expect("COULD NOT CREATE PDF FILE");
      let mut writer = BufWriter::new(file);
      document_reference
        .save(&mut writer)
        .expect("COULD NOT SAVE PDF DOCUMENT");
    }
  }
}

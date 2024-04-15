use std::{
  ffi::OsStr,
  fs::{self, File},
  io::BufWriter,
  path::Path,
};

use image::GenericImageView;
use printpdf::{Image, ImageTransform, Mm, PdfDocument};
use rxing::Exceptions;
use tauri::AppHandle;
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

use crate::{
  img,
  scanner::{
    self,
    errors::{scanner_error::ScannerError, ScannerResult},
  },
  utils,
};

#[derive(Debug)]
pub struct Pdf<P: AsRef<Path>, S: Into<String>> {
  source_path: P,
  target_path: P,
  reference: S,
}

impl<P: AsRef<Path>, S: Into<String>> Pdf<P, S> {
  pub fn new(source_path: P, target_path: P, reference: S) -> Self {
    Self {
      source_path,
      target_path,
      reference,
    }
  }

  pub fn generate_pdf(self, app_handle: &AppHandle) -> ScannerResult<()> {
    if self.source_path.as_ref().is_file() {
      self.generate_pdf_from_file(app_handle)
    } else {
      Ok(())
    }
  }

  fn generate_pdf_from_file(self, app_handle: &AppHandle) -> ScannerResult<()> {
    let source_path_data = fs::read(self.source_path.as_ref())?;
    let img = img::decode_image(source_path_data)?;

    match scanner::scan_code_128_image(&img) {
      Ok(barcode) => {
        let pdf_title = self
          .source_path
          .as_ref()
          .file_name()
          .unwrap_or(OsStr::new("PDF Document"))
          .to_os_string()
          .into_string()
          .unwrap();
        let (doc, initial_page, initial_layer) = PdfDocument::new(
          pdf_title,
          Mm(utils::convert_px_to_mm(img.width() as f32, None)),
          Mm(utils::convert_px_to_mm(img.height() as f32, None)),
          barcode.content.clone(),
        );

        let current_layer = doc.get_page(initial_page).get_layer(initial_layer);

        let img = Image::from_dynamic_image(&img);
        img.add_to_layer(current_layer, ImageTransform::default());

        doc
          .save(&mut BufWriter::new(File::create(
            self.target_path.as_ref().join(format!(
              "{}_{}.pdf",
              barcode.content,
              self.reference.into()
            )),
          )?))
          .unwrap();
      }
      Err(err) => {
        let message = match err {
          ScannerError::RxingError(Exceptions::NotFoundException(_)) => {
            "No barcode of type 128 was found in the image provided."
          }
          _ => "Couldn't scan the code out of the image provided.",
        };
        app_handle
          .dialog()
          .message(message)
          .kind(MessageDialogKind::Error)
          .title("Unable to scan barcode")
          .blocking_show();
      }
    }

    Ok(())
  }

  fn generate_pdf_from_dir(self, app_handle: &AppHandle) -> ScannerResult<()> {
    let files = utils::read_dir(self.source_path.as_ref(), None)?;

    for file in files {
      let img = img::decode_image(fs::read(file)?)?;

      match scanner::scan_code_128_image(&img) {
        Ok(barcode) => {
          let pdf_title = self
            .source_path
            .as_ref()
            .file_name()
            .unwrap_or(OsStr::new("PDF Document"))
            .to_os_string()
            .into_string()
            .unwrap();

          let (doc, initial_page, initial_layer) = PdfDocument::new(
            pdf_title,
            Mm(utils::convert_px_to_mm(img.width() as f32, None)),
            Mm(utils::convert_px_to_mm(img.height() as f32, None)),
            barcode.content.clone(),
          );

          let current_layer = doc.get_page(initial_page).get_layer(initial_layer);

          let img = Image::from_dynamic_image(&img);
          img.add_to_layer(current_layer, ImageTransform::default());
        }
        Err(err) => {
          let message = match err {
            ScannerError::RxingError(Exceptions::NotFoundException(_)) => {
              "No barcode of type 128 was found in the image provided."
            }
            _ => "Couldn't scan the code out of the image provided.",
          };
          app_handle
            .dialog()
            .message(message)
            .kind(MessageDialogKind::Error)
            .title("Unable to scan barcode")
            .blocking_show();
        }
      }
    }

    Ok(())
  }
}

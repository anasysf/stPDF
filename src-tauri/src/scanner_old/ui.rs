use std::{
  fs::File,
  io::BufWriter,
  path::{Path, PathBuf},
};

use printpdf::{Image, ImageTransform, Mm, PdfDocument};
use tauri::{AppHandle, Manager};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

use crate::utils;

use super::{PDFDocument, PDFResult, Scanner};

pub fn generate_pdf<P: AsRef<Path>>(
  app_handle: AppHandle,
  source_path: P,
  target_path: P,
  reference: String,
) {
  match utils::walk_dir_old(source_path) {
    Ok(files) => {
      let mut results: Vec<PDFResult> = Vec::new();

      let files_len = files.len();

      for (idx, file) in files.iter().enumerate() {
        app_handle
          .emit(
            "remaining-files",
            format!("Scanning {}/{files_len}", idx + 1),
          )
          .expect("COULD NOT EMIT EVENT");

        match utils::decode_image(file) {
          Ok(img) => {
            match Scanner::decode_barcode_code_128(img.clone()) {
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
          Err(err) => {
            eprintln!("{err}");

            app_handle
              .dialog()
              .message("Unable to decode image")
              .kind(MessageDialogKind::Error)
              .title("Error decoding the image.")
              .blocking_show();
          }
        };
      }

      for result in results {
        app_handle
          .emit("generating-pdfs", "Generating PDFs")
          .expect("COULD NOT EMIT EVENT");

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
    Err(err) => {
      eprintln!("{err}");

      app_handle
        .dialog()
        .message("Unable to open directory")
        .kind(MessageDialogKind::Error)
        .title("Error reading directory.")
        .blocking_show();
    }
  };
}

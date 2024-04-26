use std::{
  collections::VecDeque,
  ffi::OsStr,
  fmt::{Debug, Display},
  fs::File,
  io::BufWriter,
  path::Path,
  rc::Rc,
};

use printpdf::{
  Image, ImageTransform, Mm, PdfDocument, PdfDocumentReference, PdfLayerIndex, PdfPage,
};
use tauri::{AppHandle, EventTarget, Manager};
use tauri_plugin_dialog::DialogExt;

use crate::{
  barcode_handler,
  img::{self, DecodedImage},
  scanned_document::{child::ScannedDocumentChild, parent::ScannedDocumentParent},
  utils,
};

pub(crate) struct PDFDocument<P>
where
  P: AsRef<Path> + Debug + Display,
{
  id: Box<str>,
  title: Box<str>,
  sources: Vec<P>,
  target: P,
  reference: Box<str>,
  doc: Rc<PdfDocumentReference>,
  pages: VecDeque<Rc<PdfPage>>,
}

impl<P> PDFDocument<P>
where
  P: AsRef<Path> + Debug + Display,
{
  pub(crate) fn new(
    id: Option<Box<str>>,
    title: Box<str>,
    sources: Vec<P>,
    target: P,
    reference: Box<str>,
  ) -> Self {
    let doc = Rc::new(PdfDocument::empty(title.clone()));

    Self {
      id: id.unwrap_or("ADJ".into()),
      title,
      sources,
      target,
      reference,
      doc,
      pages: VecDeque::new(),
    }
  }

  fn new_page(
    &mut self,
    width: f32,
    height: f32,
    layer_name: Box<str>,
    page_idx: Option<usize>,
  ) -> (Rc<PdfPage>, PdfLayerIndex) {
    let (new_page, layer_idx) = PdfPage::new(
      Mm(width),
      Mm(height),
      layer_name,
      page_idx.unwrap_or(self.pages.len()),
    );

    let new_page = Rc::new(new_page);

    self.pages.push_back(Rc::clone(&new_page));

    (new_page, layer_idx)
  }
}

pub(crate) fn generate_pdfs_from_sources<P: AsRef<Path> + Debug + Display>(
  sources: Vec<P>,
  target: P,
  reference: Box<str>,
  app_handle: &AppHandle,
) {
  let mut scanned_documents = VecDeque::new();

  for source in sources {
    match DecodedImage::decode_dynamic_image(&source) {
      Ok(image) => {
        let img_file_name = source.as_ref().file_name();
        let event_payload = format!(
          "Decoding: {}",
          img_file_name
            .unwrap_or(OsStr::new("Image"))
            .to_str()
            .unwrap_or("Image")
        );

        app_handle
          .emit_to(EventTarget::App, "decoding-barcode", event_payload)
          .unwrap();

        match barcode_handler::decode_barcode_code_128(&image) {
          Ok(barcode_result) => {
            let pdf_title = img_file_name
              .unwrap_or(OsStr::new("PDF Document"))
              .to_str()
              .unwrap_or("PDF Document");

            let (doc, initial_page_idx, initial_layer_idx) = PdfDocument::new(
              pdf_title,
              Mm(utils::convert_px_to_mm(image.width() as f32, None)),
              Mm(utils::convert_px_to_mm(image.height() as f32, None)),
              "Initial layer",
            );

            let scanned_document = ScannedDocumentParent::new(
              Some(barcode_result.getText()),
              doc,
              initial_page_idx,
              initial_layer_idx,
              image,
              VecDeque::new(),
            );

            scanned_documents.push_back(scanned_document)
          }
          Err(_) => {
            if let Some(last_scanned_document) = scanned_documents.back_mut() {
              let scanned_document = ScannedDocumentChild::new(image);
              last_scanned_document.joints.push_back(scanned_document)
            }
          }
        }
      }
      Err(err) => {
        app_handle
          .dialog()
          .message(err.to_string())
          .title("Image decode error")
          .blocking_show();
      }
    }
  }

  for scanned_document in scanned_documents {
    let ScannedDocumentParent {
      id,
      doc,
      page_idx,
      layer_idx,
      image,
      joints,
    } = scanned_document;
    let current_layer = doc.get_page(page_idx).get_layer(layer_idx);

    let image = Image::from_dynamic_image(&image);
    image.add_to_layer(current_layer, ImageTransform::default());

    if !joints.is_empty() {
      for joint in joints {
        let current_layer = {
          let (page_idx, layer_idx) = doc.add_page(
            Mm(utils::convert_px_to_mm(joint.image.width() as f32, None)),
            Mm(utils::convert_px_to_mm(joint.image.height() as f32, None)),
            "Initial layer",
          );

          doc.get_page(page_idx).get_layer(layer_idx)
        };

        let image = Image::from_dynamic_image(&joint.image);
        image.add_to_layer(current_layer, ImageTransform::default());
      }
    }

    let id = id.unwrap_or("ADJ".to_string());
    let file_name = format!("{id}_{reference}.pdf");
    let file_path = target.as_ref().join(file_name);

    let event_payload = format!("Generating: {file_path:#?}");

    app_handle
      .emit_to(EventTarget::App, "generating-pdf", event_payload)
      .unwrap();

    match File::create(file_path) {
      Ok(file) => {
        if let Err(err) = doc.save(&mut BufWriter::new(file)) {
          app_handle
            .dialog()
            .message(err.to_string())
            .title("Pdf saving error")
            .blocking_show();
        }
      }
      Err(err) => {
        app_handle
          .dialog()
          .message(err.to_string())
          .title("Pdf saving error")
          .blocking_show();
      }
    }
  }

  app_handle
    .emit_to(EventTarget::App, "done-generating", "Done")
    .unwrap()
}

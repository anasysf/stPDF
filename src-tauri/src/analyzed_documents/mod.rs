use std::rc::Rc;

use serde::Serialize;
use tauri::AppHandle;

use crate::{barcode_handler, img::DecodedImage};

use self::{
  bja_document::BjaDocument, child_document::ChildDocument, parent_document::ParentDocument,
  unrecognized_document::UnrecognizedDocument,
};

pub(crate) mod bja_document;
pub(crate) mod child_document;
pub(crate) mod parent_document;
pub(crate) mod unrecognized_document;

/* #[derive(Serialize)]
pub(crate) enum AnalyzedDocument {
Adj(AdjDocument),
Parent(ParentDocument),
Child(ChildDocument),
Unrecognized(UnrecognizedDocument),
} */

#[derive(Serialize, Debug)]
#[serde(tag = "type")]
pub(crate) enum AnalyzedDocuments {
  Bja(BjaDocument),
  Parent(ParentDocument),
  Unrecognized(UnrecognizedDocument),
}

impl AnalyzedDocuments {
  pub(crate) fn analyze_sources(app_handle: &AppHandle, sources: Vec<Box<str>>) -> Vec<Self> {
    let mut analyzed_documents = Vec::new();

    for decoded_image in DecodedImage::decode_dynamic_images(app_handle, sources) {
      match barcode_handler::decode_barcode_code_128(&decoded_image.dynamic_image) {
        Ok(result) => {
          let parent_document =
            ParentDocument::new(decoded_image.path, result.getText(), Rc::default());
          analyzed_documents.push(Self::Parent(parent_document))
        }
        Err(_) => {
          if let Some(last_analyzed_document) = analyzed_documents.last() {
            match last_analyzed_document {
              AnalyzedDocuments::Bja(_) => {
                let unrecognized_document = UnrecognizedDocument::new(decoded_image.path);
                analyzed_documents.push(Self::Unrecognized(unrecognized_document))
              }
              AnalyzedDocuments::Parent(parent) => {
                let children = Rc::clone(&parent.children);
                let child = ChildDocument::new(decoded_image.path, &parent.barcode);

                children.borrow_mut().push(child);
              }
              AnalyzedDocuments::Unrecognized(_) => {
                let unrecognized_document = UnrecognizedDocument::new(decoded_image.path);
                analyzed_documents.push(Self::Unrecognized(unrecognized_document))
              }
            }
          } else {
            let adj_document = BjaDocument::new(decoded_image.path);
            analyzed_documents.push(Self::Bja(adj_document))
          }
        }
      }
    }

    analyzed_documents
  }
}

use std::collections::VecDeque;

use image::DynamicImage;
use printpdf::{PdfDocumentReference, PdfLayerIndex, PdfPageIndex};

use super::child::ScannedDocumentChild;

pub(crate) struct ScannedDocumentParent {
  pub(crate) id: Option<String>,
  pub(crate) doc: PdfDocumentReference,
  pub(crate) page_idx: PdfPageIndex,
  pub(crate) layer_idx: PdfLayerIndex,
  pub(crate) image: DynamicImage,
  pub(crate) joints: VecDeque<ScannedDocumentChild>,
}

impl ScannedDocumentParent {
  pub(crate) fn new(
    id: Option<&str>,
    doc: PdfDocumentReference,
    page_idx: PdfPageIndex,
    layer_idx: PdfLayerIndex,
    image: DynamicImage,
    joints: VecDeque<ScannedDocumentChild>,
  ) -> Self {
    Self {
      id: id.map(|id| id.to_string()),
      doc,
      page_idx,
      layer_idx,
      image,
      joints,
    }
  }
}

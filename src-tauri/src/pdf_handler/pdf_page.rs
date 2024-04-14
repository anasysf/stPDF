use pdf_writer::{writers::Page, Ref};

use super::PdfDoc;

pub struct PdfPage<'a> {
  pub id: Ref,
  page: Page<'a>,
}

impl<'a> PdfPage<'a> {
  pub fn new(pdf_doc: &'a mut PdfDoc<'a>) -> Self {
    let id = pdf_doc.alloc.bump();
    let page = pdf_doc.pdf.page(id);

    Self { id, page }
  }
}

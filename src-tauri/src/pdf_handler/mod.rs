mod pdf_page;

use std::collections::VecDeque;

use pdf_writer::{Pdf, Ref};

use self::pdf_page::PdfPage;

pub struct PdfDoc<'a> {
  pdf: Pdf,
  alloc: Ref,
  page_tree_id: Ref,
  pages: VecDeque<PdfPage<'a>>,
  catalog_id: Ref,
}

impl<'a> PdfDoc<'a> {
  pub fn new() -> Self {
    let mut pdf = Pdf::new();

    let mut alloc = Ref::new(1);

    let page_tree_id = alloc.bump();

    let pages: VecDeque<PdfPage<'a>> = VecDeque::default();

    let page_ids = pages.iter().map(|page| page.id).collect::<Vec<Ref>>();

    pdf
      .pages(page_tree_id)
      .kids(page_ids.iter().copied())
      .count(page_ids.len() as i32);

    let catalog_id = alloc.bump();

    pdf
      .catalog(catalog_id)
      .pages(page_tree_id);


    Self { pdf, alloc, page_tree_id, pages, catalog_id, }
  }

  pub fn new_page(&'a mut self) -> PdfPage<'a> { PdfPage::new(self) }

  fn get_page_by_ref(&'a self, page_ref: &Ref) -> Option<&'a PdfPage<'a>> {
    self.pages.iter().find(|&page| page.id.eq(page_ref))
  }
}

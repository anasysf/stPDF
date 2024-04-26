use std::{cell::RefCell, path::PathBuf, rc::Rc};

use serde::Serialize;

use super::child_document::ChildDocument;

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ParentDocument {
  pub(crate) image_path: Box<str>,
  pub(crate) barcode: Box<str>,
  pub(crate) children: Rc<RefCell<Vec<ChildDocument>>>,
}

impl ParentDocument {
  pub(crate) fn new(
    image_path: PathBuf,
    barcode: &str,
    children: Rc<RefCell<Vec<ChildDocument>>>,
  ) -> Self {
    Self {
      image_path: image_path.display().to_string().into_boxed_str(),
      barcode: barcode.into(),
      children,
    }
  }
}

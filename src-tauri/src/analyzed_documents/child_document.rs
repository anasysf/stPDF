use std::path::PathBuf;

use serde::Serialize;

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ChildDocument {
    image_path: Box<str>,
    parent_barcode: Box<str>,
}

impl ChildDocument {
    pub(crate) fn new(image_path: PathBuf, parent_barcode: &str) -> Self {
        Self {
            image_path: image_path.display().to_string().into_boxed_str(),
            parent_barcode: parent_barcode.into(),
        }
    }
}

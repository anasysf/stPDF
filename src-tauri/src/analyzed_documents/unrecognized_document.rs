use std::path::PathBuf;

use serde::Serialize;

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UnrecognizedDocument {
    pub(crate) image_path: Box<str>,
}

impl UnrecognizedDocument {
    pub(crate) fn new(image_path: PathBuf) -> Self {
        Self { image_path: image_path.display().to_string().into_boxed_str() }
    }
}

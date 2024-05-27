use std::{ffi::OsStr, fmt::Display, path::Path};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentMetadata<P: AsRef<Path> + Clone + Display + Send + Sync> {
    pub image_path: P,
    pub file_name: Box<OsStr>,
    size: Box<str>,
}

impl<P: AsRef<Path> + Clone + Display + Send + Sync> DocumentMetadata<P> {
    pub fn new(image_path: P, file_name: Box<OsStr>, size: Box<str>) -> Self {
        Self { image_path, file_name, size }
    }
}

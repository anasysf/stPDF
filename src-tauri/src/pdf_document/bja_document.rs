use std::{ffi::OsStr, fmt::Display, path::Path};

use crate::analyzed_document::AnalyzedDocument;

pub struct BjaDocument<P: AsRef<Path> + Clone + Display + Send + Sync> {
    pub image_path: P,
    pub file_name: Box<OsStr>,
}

impl<P: AsRef<Path> + Clone + Display + Send + Sync> BjaDocument<P> {
    pub fn new(image_path: P, file_name: Box<OsStr>) -> Self {
        Self { image_path, file_name }
    }
}

impl<P: AsRef<Path> + Clone + Display + Send + Sync> From<AnalyzedDocument<P>> for BjaDocument<P> {
    fn from(analyzed_document: AnalyzedDocument<P>) -> Self {
        Self::new(analyzed_document.metadata.image_path, analyzed_document.metadata.file_name)
    }
}

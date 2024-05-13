use std::{ffi::OsStr, fmt::Display, path::Path};

use crate::analyzed_document::AnalyzedDocument;

use super::child_document::ChildDocument;

pub struct ParentDocument<P: AsRef<Path> + Clone + Display + Send + Sync> {
    pub identifier: Box<str>,
    pub image_path: P,
    pub file_name: Box<OsStr>,
    pub children: Vec<ChildDocument<P>>,
}

impl<P: AsRef<Path> + Clone + Display + Send + Sync> ParentDocument<P> {
    pub fn new(
        identifier: Box<str>,
        image_path: P,
        file_name: Box<OsStr>,
        children: Vec<ChildDocument<P>>,
    ) -> Self {
        Self { identifier, image_path, file_name, children }
    }
}

impl<P: AsRef<Path> + Clone + Display + Send + Sync> From<AnalyzedDocument<P>>
    for ParentDocument<P>
{
    fn from(analyzed_document: AnalyzedDocument<P>) -> Self {
        Self::new(
            analyzed_document.identifier.unwrap(),
            analyzed_document.metadata.image_path,
            analyzed_document.metadata.file_name,
            vec![],
        )
    }
}

use crate::analyzed_document::AnalyzedDocument;

use super::child_document::ChildDocument;

pub(crate) struct ParentDocument {
    pub(crate) identifier: String,
    pub(crate) image_path: Box<str>,
    pub(crate) file_name: String,
    pub(crate) children: Vec<ChildDocument>,
}

impl ParentDocument {
    pub(crate) fn new(
        identifier: String,
        image_path: Box<str>,
        file_name: String,
        children: Vec<ChildDocument>,
    ) -> Self {
        Self { identifier, image_path, file_name, children }
    }
}

impl From<AnalyzedDocument> for ParentDocument {
    fn from(analyzed_document: AnalyzedDocument) -> Self {
        Self::new(
            analyzed_document.identifier.unwrap(),
            analyzed_document.image_path,
            analyzed_document.file_name,
            Vec::new(),
        )
    }
}

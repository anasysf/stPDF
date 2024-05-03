use crate::analyzed_document::AnalyzedDocument;

pub(crate) struct BjaDocument {
    pub(crate) image_path: Box<str>,
    pub(crate) file_name: String,
}

impl BjaDocument {
    pub(crate) fn new(image_path: Box<str>, file_name: String) -> Self {
        Self { image_path, file_name }
    }
}

impl From<AnalyzedDocument> for BjaDocument {
    fn from(analyzed_document: AnalyzedDocument) -> Self {
        Self::new(analyzed_document.image_path, analyzed_document.file_name)
    }
}
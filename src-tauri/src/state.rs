use std::{collections::HashMap, path::PathBuf, sync::Mutex};

use image::DynamicImage;

pub type AppState = Mutex<InnerState>;

type DynamicDocumentMap = HashMap<PathBuf, DynamicImage>;
type PdfPagesMap = HashMap<PathBuf, u16>;

#[derive(Default)]
pub struct InnerState {
    pub dynamic_document_map: DynamicDocumentMap,
    pub pdf_pages_map: PdfPagesMap,
}

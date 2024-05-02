use std::{fs::File, io::BufWriter, path::Path};

use image::GenericImageView;
use printpdf::{Image, ImageTransform, Mm, PdfDocument};
use tauri::{AppHandle, EventTarget, Manager};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

use crate::{analyzed_document::AnalyzedDocument, utils};

use super::{
    bja_document::BjaDocument, child_document::ChildDocument, parent_document::ParentDocument,
};

pub(crate) enum Document {
    Bja(BjaDocument),
    Parent(ParentDocument),
}

impl Document {
    pub(crate) fn from_analyzed_documents(analyzed_documents: Vec<AnalyzedDocument>) -> Vec<Self> {
        let mut documents = Vec::new();

        for analyzed_document in analyzed_documents {
            match analyzed_document.identifier {
                Some(_) => {
                    let parent_document = ParentDocument::from(analyzed_document);
                    documents.push(Self::Parent(parent_document))
                }
                None => {
                    if let Some(last_document) = documents.last_mut() {
                        if let Document::Parent(parent_document) = last_document {
                            let ParentDocument { children, .. } = parent_document;

                            let child_document = ChildDocument::from(analyzed_document);
                            children.push(child_document)
                        }
                    } else {
                        let bja_document = BjaDocument::from(analyzed_document);
                        documents.push(Self::Bja(bja_document))
                    }
                }
            }
        }

        documents
    }

    pub(crate) fn generate_pdfs(
        app_handle: AppHandle,
        documents: Vec<Self>,
        target_directory: Box<str>,
        reference: Box<str>,
    ) {
        app_handle.emit_to(EventTarget::App, "started-generating-pdfs", documents.len()).unwrap();

        for (idx, document) in documents.iter().enumerate() {
            app_handle.emit_to(EventTarget::App, "current-pdf", idx + 1).unwrap();

            match document {
                Document::Bja(bja_document) => {
                    match image::open(bja_document.image_path.as_ref()) {
                        Ok(image) => {
                            let (width, height) = image.dimensions();
                            let (doc, initial_page, initial_layer) = PdfDocument::new(
                                bja_document.file_name.clone(),
                                Mm(utils::convert_px_to_mm(width as f32, None)),
                                Mm(utils::convert_px_to_mm(height as f32, None)),
                                "First Layer",
                            );
                            let current_layer = doc.get_page(initial_page).get_layer(initial_layer);

                            // let image = image.resize(2480, 3508, FilterType::Nearest);
                            let image = Image::from_dynamic_image(&image);
                            image.add_to_layer(current_layer, ImageTransform::default());

                            let file_name = format!("BJA_{reference}.pdf");
                            let pdf_path = Path::new(target_directory.as_ref()).join(file_name);

                            match File::create(pdf_path) {
                                Ok(file) => {
                                    if let Err(err) = doc.save(&mut BufWriter::new(file)) {
                                        app_handle
                                        .dialog()
                                        .message(err.to_string())
                                        .title("An error has occurred while trying to save the pdf file.")
                                        .kind(MessageDialogKind::Error)
                                        .blocking_show();
                                    }
                                }
                                Err(err) => {
                                    app_handle
                                        .dialog()
                                        .message(err.to_string())
                                        .title("An error has occurred while trying to create the pdf file.")
                                        .kind(MessageDialogKind::Error)
                                        .blocking_show();
                                }
                            }
                        }
                        Err(err) => {
                            app_handle
                                .dialog()
                                .message(err.to_string())
                                .title("An error has occurred while trying to read the image.")
                                .kind(MessageDialogKind::Error)
                                .blocking_show();
                        }
                    };
                }
                Document::Parent(parent_document) => {
                    match image::open(parent_document.image_path.as_ref()) {
                        Ok(image) => {
                            let (width, height) = image.dimensions();
                            let (doc, initial_page, initial_layer) = PdfDocument::new(
                                parent_document.file_name.clone(),
                                Mm(utils::convert_px_to_mm(width as f32, None)),
                                Mm(utils::convert_px_to_mm(height as f32, None)),
                                "First Layer",
                            );
                            let current_layer = doc.get_page(initial_page).get_layer(initial_layer);

                            // let image = image.resize(2480, 3508, FilterType::Nearest);
                            let image = Image::from_dynamic_image(&image);
                            image.add_to_layer(current_layer, ImageTransform::default());

                            for child in parent_document.children.iter() {
                                match image::open(child.image_path.as_ref()) {
                                    Ok(image) => {
                                        // let image = image.resize(2480, 3508, FilterType::Nearest);
                                        let (width, height) = image.dimensions();
                                        let image = Image::from_dynamic_image(&image);
                                        let current_layer = {
                                            let (page_idx, layer_idx) = doc.add_page(
                                                Mm(utils::convert_px_to_mm(width as f32, None)),
                                                Mm(utils::convert_px_to_mm(height as f32, None)),
                                                child.file_name.clone(),
                                            );
                                            doc.get_page(page_idx).get_layer(layer_idx)
                                        };
                                        image
                                            .add_to_layer(current_layer, ImageTransform::default());
                                    }
                                    Err(err) => {
                                        app_handle
                                            .dialog()
                                            .message(err.to_string())
                                            .title("An error has occurred while trying to read the image.")
                                            .kind(MessageDialogKind::Error)
                                            .blocking_show();
                                    }
                                }
                            }

                            let identifier = parent_document.identifier.clone();
                            let file_name = format!("{identifier}_{reference}.pdf");
                            let pdf_path = Path::new(target_directory.as_ref()).join(file_name);

                            match File::create(pdf_path) {
                                Ok(file) => {
                                    if let Err(err) = doc.save(&mut BufWriter::new(file)) {
                                        app_handle
                                        .dialog()
                                        .message(err.to_string())
                                        .title("An error has occurred while trying to save the pdf file.")
                                        .kind(MessageDialogKind::Error)
                                        .blocking_show();
                                    }
                                }
                                Err(err) => {
                                    app_handle
                                        .dialog()
                                        .message(err.to_string())
                                        .title("An error has occurred while trying to create the pdf file.")
                                        .kind(MessageDialogKind::Error)
                                        .blocking_show();
                                }
                            }
                        }
                        Err(err) => {
                            app_handle
                                .dialog()
                                .message(err.to_string())
                                .title("An error has occurred while trying to create the pdf file.")
                                .kind(MessageDialogKind::Error)
                                .blocking_show();
                        }
                    };
                }
            }
        }

        app_handle.emit_to(EventTarget::App, "done-generating-pdfs", ()).unwrap();
    }
}

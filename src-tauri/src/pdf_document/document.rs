use std::{
    fmt::Display,
    fs::File,
    io::BufWriter,
    path::Path,
    sync::{Arc, Mutex},
    time::Instant,
};

use humantime::format_duration;
use image::GenericImageView;
use printpdf::{BuiltinFont, Color, Image, ImageTransform, Mm, PdfDocument, Rgb};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use tauri::{AppHandle, EventTarget, Manager, State};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

use crate::{
    analyzed_document::AnalyzedDocument, registries::options_registry::OptionsRegistry,
    state::AppState, utils,
};

use super::{
    bja_document::BjaDocument, child_document::ChildDocument, parent_document::ParentDocument,
};

pub enum Document {
    Bja(BjaDocument),
    Parent(ParentDocument),
}

impl Document {
    pub fn from_analyzed_documents<P: AsRef<Path> + Clone + Display + Send + Sync>(
        state: &State<AppState>,
        analyzed_documents: Vec<AnalyzedDocument<P>>,
    ) -> Vec<Self> {
        let mut documents = Vec::new();

        for analyzed_document in analyzed_documents {
            match analyzed_document.identifier {
                Some(ref identifier) => {
                    if !identifier.is_empty() {
                        let parent_document =
                            ParentDocument::from_analyzed_docs(state, analyzed_document);
                        documents.push(Self::Parent(parent_document))
                    }
                }
                None => {
                    if let Some(last_document) = documents.last_mut() {
                        if let Document::Parent(parent_document) = last_document {
                            let ParentDocument { children, .. } = parent_document;

                            let child_document =
                                ChildDocument::from_analyzed_docs(state, analyzed_document);
                            children.push(child_document)
                        }
                    } else {
                        let bja_document =
                            BjaDocument::from_analyzed_docs(state, analyzed_document);
                        documents.push(Self::Bja(bja_document))
                    }
                }
            }
        }

        documents
    }

    pub fn generate_pdfs<P: AsRef<Path> + Clone + Display + Send + Sync>(
        app_handle: AppHandle,
        state: State<AppState>,
        documents: Vec<Self>,
        options_registry: &OptionsRegistry<P>,
    ) {
        app_handle.emit_to(EventTarget::App, "started-generating-pdfs", documents.len()).unwrap();
        let duration = Instant::now();

        /* const A4_W_PX: u32 = 2480;
        const A4_H_PX: u32 = 3508; */

        let count = Arc::new(Mutex::new(0u64));
        // let count = Arc::new(Mutex::new(0u64));
        let red = Rgb::new(255., 0., 0., None);

        documents.par_iter().inspect(|_| *count.lock().unwrap() += 1).for_each(|document| {
            app_handle.emit_to(EventTarget::App, "current-pdf", *count.lock().unwrap()).unwrap();

            let OptionsRegistry { reference, watermark, ref target_dir, .. } = options_registry;

            match document {
                Document::Bja(bja_document) => {
                    let image = bja_document.dynamic_image.to_owned();

                    let (width, height) = image.dimensions();
                    let (doc, initial_page, initial_layer) = PdfDocument::new(
                        bja_document.file_name.to_str().unwrap_or("UNKNOWN"),
                        Mm(utils::convert_px_to_mm(width as f32, None)),
                        Mm(utils::convert_px_to_mm(height as f32, None)),
                        "First Layer",
                    );
                    let current_layer = doc.get_page(initial_page).get_layer(initial_layer);

                    /* let (width, height) = image.dimensions();
                    let image = if width != A4_W_PX && height != A4_H_PX {
                    image.resize(A4_W_PX, A4_H_PX, FilterType::Nearest)
                    } else {
                    image
                    }; */
                    // let image = image.resize(2480, 3508, FilterType::Nearest);
                    let image = Image::from_dynamic_image(&image);
                    image.add_to_layer(current_layer, ImageTransform::default());

                    let text_layer = doc.get_page(initial_page).add_layer("Watermark Layer");
                    let font = doc.add_builtin_font(BuiltinFont::TimesRoman).unwrap();
                    text_layer.begin_text_section();
                    text_layer.set_fill_color(Color::Rgb(red.clone()));
                    text_layer.set_font(&font, 15.);
                    text_layer.set_text_cursor(Mm(5.), Mm(5.));
                    text_layer.write_text(*watermark, &font);
                    text_layer.end_text_section();
                    // text_layer.use_text(*watermark, 20., Mm(0.), Mm(0.), &font);

                    let file_name = format!("BJA_{reference}.pdf");
                    let pdf_path = Path::new(target_dir.as_ref()).join(file_name);

                    match File::create(pdf_path) {
                        Ok(file) => {
                            if let Err(err) = doc.save(&mut BufWriter::new(file)) {
                                app_handle
                                    .dialog()
                                    .message(err.to_string())
                                    .title(
                                        "An error has occurred while trying to save the pdf file.",
                                    )
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
                Document::Parent(parent_document) => {
                    let mut pages_count = 1u16;
                    let image = parent_document.dynamic_image.to_owned();

                    let (width, height) = image.dimensions();
                    let (doc, initial_page, initial_layer) = PdfDocument::new(
                        parent_document.file_name.to_str().unwrap_or("UNKNOWN"),
                        Mm(utils::convert_px_to_mm(width as f32, None)),
                        Mm(utils::convert_px_to_mm(height as f32, None)),
                        "First Layer",
                    );
                    let current_layer = doc.get_page(initial_page).get_layer(initial_layer);

                    /* let image = if width != A4_W_PX && height != A4_H_PX {
                    image.resize(A4_W_PX, A4_H_PX, FilterType::Nearest)
                    } else {
                    image
                    }; */
                    let image = Image::from_dynamic_image(&image);
                    image.add_to_layer(current_layer, ImageTransform::default());

                    let text_layer = doc.get_page(initial_page).add_layer("Watermark Layer");
                    let font = doc.add_builtin_font(BuiltinFont::TimesRoman).unwrap();
                    text_layer.begin_text_section();
                    text_layer.set_fill_color(Color::Rgb(red.clone()));
                    text_layer.set_font(&font, 15.);
                    text_layer.set_text_cursor(Mm(5.), Mm(5.));
                    text_layer.write_text(*watermark, &font);
                    text_layer.end_text_section();

                    for child in parent_document.children.iter() {
                        let image = child.dynamic_image.to_owned();

                        /* let image = if width != A4_W_PX && height != A4_H_PX {
                        image.resize(A4_W_PX, A4_H_PX, FilterType::Nearest)
                        } else {
                        image
                        }; */

                        let (width, height) = image.dimensions();
                        let image = Image::from_dynamic_image(&image);
                        let (current_layer, page_idx) = {
                            let (page_idx, layer_idx) = doc.add_page(
                                Mm(utils::convert_px_to_mm(width as f32, None)),
                                Mm(utils::convert_px_to_mm(height as f32, None)),
                                child.file_name.to_str().unwrap_or("UNKNOWN"),
                            );
                            (doc.get_page(page_idx).get_layer(layer_idx), page_idx)
                        };
                        image.add_to_layer(current_layer, ImageTransform::default());

                        let text_layer = doc.get_page(page_idx).add_layer("Watermark Layer");
                        let font = doc.add_builtin_font(BuiltinFont::TimesRoman).unwrap();
                        text_layer.begin_text_section();
                        text_layer.set_fill_color(Color::Rgb(red.clone()));
                        text_layer.set_font(&font, 15.);
                        text_layer.set_text_cursor(Mm(5.), Mm(5.));
                        text_layer.write_text(*watermark, &font);
                        text_layer.end_text_section();
                        pages_count += 1;
                    }

                    let identifier = parent_document.identifier.clone();
                    let file_name = format!("{identifier}_{reference}.pdf");
                    let pdf_path = Path::new(target_dir.as_ref()).join(file_name);

                    state.lock().unwrap().pdf_pages_map.insert(pdf_path.clone(), pages_count);

                    match File::create(pdf_path) {
                        Ok(file) => {
                            if let Err(err) = doc.save(&mut BufWriter::new(file)) {
                                app_handle
                                    .dialog()
                                    .message(err.to_string())
                                    .title(
                                        "An error has occurred while trying to save the pdf file.",
                                    )
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
            }
        });

        app_handle
            .emit_to(
                EventTarget::App,
                "done-generating-pdfs",
                format_duration(duration.elapsed()).to_string(),
            )
            .ok();
    }
}

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, path::Path};

use image::{ColorType, GenericImageView, ImageFormat};
use miniz_oxide::deflate::{compress_to_vec_zlib, CompressionLevel};
// use pdf::Pdf;
use pdf_writer::{Content, Filter, Finish, Name, Pdf, Rect, Ref};
use tauri::AppHandle;

mod img;
mod pdf;
mod scanner;
mod scanner_old;
mod utils;
mod pdf_handler;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn generate_pdf(
  app_handle: AppHandle,
  source_path: String,
  target_path: String,
  reference: String,
) {
  // Scanner::generate_pdf(source_path, target_path, reference)
  scanner_old::ui::generate_pdf(app_handle, source_path, target_path, reference)
}

fn main() {
  /* let mut pdf = Pdf::new();

  let mut alloc = Ref::new(1);

  let page_tree_id = alloc.bump();
  let mut page_ids = vec![];

  let page_id = alloc.bump();
  page_ids.push(page_id);

  pdf
    .pages(page_tree_id)
    .kids(page_ids.iter().copied())
    .count(page_ids.len() as i32);

  pdf.catalog(alloc.bump()).pages(page_tree_id);

  let mut page = pdf.page(page_id);

  let data = fs::read(Path::new("/home/lbandi/Downloads/2024/001.png")).unwrap();
  let format = image::guess_format(&data).unwrap();
  let img = image::load_from_memory(&data).unwrap();

  // let media_box = Rect::new(0., 0., img.width() as f32, img.height() as f32);
  let media_box = Rect::new(0., 0., 595., 842.);
  page.media_box(media_box);
  page.parent(page_tree_id);

  let content_id = alloc.bump();
  page.contents(content_id);

  let image_name = Name(b"Im1");
  let image_id = alloc.bump();
  page.resources().x_objects().pair(image_name, image_id);
  page.finish();

  let (filter, encoded, mask) = match format {
    // A JPEG is already valid DCT-encoded data.
    ImageFormat::Jpeg => {
      assert!(img.color() == ColorType::Rgb8);
      (Filter::DctDecode, data, None)
    }

    // While PNGs uses deflate internally, we need to re-encode to get just
    // the raw coded samples without metadata. Also, we need to encode the
    // RGB and alpha data separately.
    ImageFormat::Png => {
      let level = CompressionLevel::DefaultLevel as u8;
      let encoded = compress_to_vec_zlib(img.to_rgb8().as_raw(), level);

      // If there's an alpha channel, extract the pixel alpha values.
      let mask = img.color().has_alpha().then(|| {
        let alphas: Vec<_> = img.pixels().map(|p| (p.2).0[3]).collect();
        compress_to_vec_zlib(&alphas, level)
      });

      (Filter::FlateDecode, encoded, mask)
    }

    // You could handle other image formats similarly or just recode them to
    // JPEG or PNG, whatever best fits your use case.
    _ => panic!("unsupported image format"),
  };

  let mut image = pdf.image_xobject(image_id, &encoded);
  image.filter(filter);
  image.width(img.width() as i32);
  image.height(img.height() as i32);
  image.color_space().device_rgb();
  image.bits_per_component(8);

  let s_mask_id = alloc.bump();
  if mask.is_some() {
    image.s_mask(s_mask_id);
  }
  image.finish();

  if let Some(encoded) = &mask {
    let mut s_mask = pdf.image_xobject(s_mask_id, encoded);
    s_mask.filter(filter);
    s_mask.width(img.width() as i32);
    s_mask.height(img.height() as i32);
    s_mask.color_space().device_gray();
    s_mask.bits_per_component(8);
  }

  let w = img.width() as f32;
  let h = img.height() as f32;

  // Center the image on the page.
  let x = (media_box.x2 - w) / 2.;
  let y = (media_box.y2 - h) / 2.;

  let mut content = Content::new();
  content.save_state();
  content.transform([w, 0., 0., h, x, y]);
  content.x_object(image_name);
  content.restore_state();
  pdf.stream(content_id, &content.finish());

  fs::write(Path::new("/home/lbandi/Downloads/test.pdf"), pdf.finish()).unwrap(); */

  tauri::Builder::default()
    /* .setup(|app| {
      let pdf = Pdf::new(
        "C:\\Users\\anayo\\Pictures\\2024-03-22\\001.png",
        "C:\\Users\\anayo\\Pictures\\pdfs",
        "666",
      );
      pdf.generate_pdf(app.handle()).unwrap();
      Ok(())
    }) */
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![greet, generate_pdf])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

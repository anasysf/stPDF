use std::{fmt::Debug, path::{Path, PathBuf}};

use image::{imageops::{self, FilterType}, DynamicImage, GenericImageView, ImageBuffer, Rgba};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use serde::Serialize;
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

use crate::registries::options_registry::OptionsRegistry;

#[derive(Serialize)]
pub(crate) struct DecodedImage {
    pub(crate) path: PathBuf,
    #[serde(skip_serializing)]
    pub(crate) dynamic_image: DynamicImage,
}

pub(crate) struct DecodedImages<P: AsRef<Path> + Clone> {
    pub(crate) path: P,
    pub(crate) sub_image: ImageBuffer<Rgba<u8>, Vec<u8>>,
    pub(crate) dynamic_image: DynamicImage,
}

impl<P: AsRef<Path> + Clone> DecodedImages<P> {
    pub(crate) fn new(
        path: P,
        sub_image: ImageBuffer<Rgba<u8>, Vec<u8>>,
        dynamic_image: DynamicImage,
    ) -> Self {
        Self {
            path,
            sub_image,
            dynamic_image,
        }
    }

    fn sub_image(dynamic_image: &DynamicImage, divide_by: u32) -> ImageBuffer<Rgba<u8>, Vec<u8>> {
        let (width, height) = dynamic_image.dimensions();
        dynamic_image
            .view(0, 0, width, height / divide_by)
            .to_image()
    }

    pub(crate) fn to_decoded_images(options_registry: OptionsRegistry<P>) -> Box<[Self]> {
        options_registry
            .sources
            .iter()
            .filter_map(|source| match image::open(source) {
                Ok(image) => {
                    let sub_image = Self::sub_image(&image, 10);
                    Some(Self::new(source.clone(), sub_image, image))
                },
                Err(err) => {
                    eprintln!("{err}");
                    None
                },
            })
            .collect()
    }

    pub(crate) fn compress(&self, filter_type: FilterType) -> ImageBuffer<Rgba<u8>, Vec<u8>> {
        imageops::resize(
            &DynamicImage::from(self.sub_image.clone()),
            self.sub_image.width(),
            self.sub_image.height(),
            filter_type,
        )
    }
}

impl Debug for DecodedImage {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("DecodedImage").field("path", &self.path).finish()
    }
}

impl DecodedImage {
    fn new(path: PathBuf, dynamic_image: DynamicImage) -> Self {
        Self { path, dynamic_image }
    }

    pub(crate) fn decode_dynamic_images(
        app_handle: &AppHandle,
        sources: Vec<Box<str>>,
    ) -> Vec<Self> {

        sources
            .par_iter()
            .filter_map(|source| match image::open(source.to_string()) {
                Ok(dynamic_image) => {
                    let (width, height) = dynamic_image.dimensions();
                    let sub_image = dynamic_image.view(0, 0, width, height / 10);
                    let dynamic_image = DynamicImage::ImageRgba8(sub_image.to_image());

                    Some(Self::new(PathBuf::from(source.to_string()), dynamic_image))
                }
                Err(err) => {
                    app_handle
                        .dialog()
                        .message(err.to_string())
                        .title("Oops..! Error analyzing image...")
                        .blocking_show();
                    None
                }
            })
            .collect::<Vec<_>>()
    }
}

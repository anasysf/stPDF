use std::{fmt::Display, path::Path};

use image::{
    imageops::{self, FilterType},
    DynamicImage, GenericImageView, ImageBuffer, Rgba,
};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};

use crate::registries::options_registry::OptionsRegistry;

pub struct DecodedImage<P: AsRef<Path> + Clone + Display + Send + Sync> {
    pub path: P,
    pub sub_image: ImageBuffer<Rgba<u8>, Vec<u8>>,
    pub dynamic_image: DynamicImage,
}

impl<P: AsRef<Path> + Clone + Display + Send + Sync> DecodedImage<P> {
    pub fn new(
        path: P,
        sub_image: ImageBuffer<Rgba<u8>, Vec<u8>>,
        dynamic_image: DynamicImage,
    ) -> Self {
        Self { path, sub_image, dynamic_image }
    }

    fn sub_image(dynamic_image: &DynamicImage, divide_by: u32) -> ImageBuffer<Rgba<u8>, Vec<u8>> {
        let (width, height) = dynamic_image.dimensions();
        dynamic_image.view(0, 0, width, height / divide_by).to_image()
    }

    pub fn to_decoded_images(options_registry: &OptionsRegistry<P>) -> Vec<Self> {
        options_registry
            .sources
            .par_iter()
            .filter_map(|source| match image::open(source) {
                Ok(image) => {
                    let sub_image = Self::sub_image(&image, 10);
                    Some(Self::new(source.clone(), sub_image, image))
                }
                Err(err) => {
                    eprintln!("{err}");
                    None
                }
            })
            .collect()
    }

    pub fn _compress(&self, filter_type: FilterType) -> ImageBuffer<Rgba<u8>, Vec<u8>> {
        imageops::resize(
            &DynamicImage::from(self.sub_image.clone()),
            self.sub_image.width(),
            self.sub_image.height(),
            filter_type,
        )
    }
}

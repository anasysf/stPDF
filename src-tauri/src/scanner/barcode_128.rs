use image::DynamicImage;
use rxing::RXingResult;

#[derive(Debug)]
pub struct Barcode128 {
  pub content: String,
  pub img: DynamicImage,
}

impl Barcode128 {
  pub fn new(result: RXingResult, img: DynamicImage) -> Self {
    Self {
      content: String::from(result.getText()),
      img,
    }
  }
}

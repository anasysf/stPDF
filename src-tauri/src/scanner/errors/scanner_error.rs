use std::io;

use thiserror::Error;

#[derive(Debug, Error)]
pub enum ScannerError {
  #[error(transparent)]
  Io(#[from] io::Error),

  #[error(transparent)]
  ImageError(#[from] image::ImageError),

  #[error(transparent)]
  RxingError(#[from] rxing::Exceptions),
}

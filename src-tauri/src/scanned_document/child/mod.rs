use image::DynamicImage;

pub(crate) struct ScannedDocumentChild {
    pub(crate) image: DynamicImage,
}

impl ScannedDocumentChild {
    pub(crate) fn new(image: DynamicImage) -> Self {
        Self { image }
    }
}

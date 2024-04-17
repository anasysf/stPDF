pub(crate) fn convert_px_to_mm(px: f32, dpi: Option<f32>) -> f32 {
  const INCH_TO_CM: f32 = 25.4f32;
  let dpi = dpi.unwrap_or(300f32);

  px * (INCH_TO_CM / dpi)
}

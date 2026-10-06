//! Кодирование готового холста в AVIF и WebP с хешем содержимого в имени.
//!
//! Имя `<slug>.<hash>.<ext>` меняется только вместе с пикселями, поэтому
//! сайт может отдавать картинки с `Cache-Control: immutable`.

use crate::render;
use image::RgbaImage;
use ravif::{Encoder, Img, RGBA8};
use sha2::{Digest, Sha256};
use std::collections::BTreeMap;
use std::path::Path;

/// Качество кодирования.
#[derive(Debug, Clone, Copy)]
pub struct Quality {
    /// AVIF, 0–100.
    pub avif: f32,
    /// WebP с потерями, 0–100.
    pub webp: f32,
    /// Скорость AVIF-кодера, 1 (медленно, мельче) – 10 (быстро).
    pub avif_speed: u8,
}

impl Default for Quality {
    fn default() -> Self {
        Self {
            avif: 80.0,
            webp: 85.0,
            avif_speed: 6,
        }
    }
}

/// Имена записанных файлов одной картинки (относительно папки вывода).
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
pub struct Encoded {
    /// Файл AVIF.
    pub avif: String,
    /// Файл WebP.
    pub webp: String,
}

/// Первые 10 hex-символов SHA-256 от пикселей и размеров.
pub fn content_hash(img: &RgbaImage) -> String {
    let mut hasher = Sha256::new();
    hasher.update(img.width().to_le_bytes());
    hasher.update(img.height().to_le_bytes());
    hasher.update(img.as_raw());
    let digest = hasher.finalize();
    digest
        .iter()
        .take(5)
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

/// Кодирует холст и пишет `<dir>/<stem>.<hash>.{avif,webp}`.
///
/// # Errors
/// Кодер вернул ошибку или файл не записался.
pub fn write(
    img: &RgbaImage,
    dir: &Path,
    rel_dir: &str,
    stem: &str,
    q: Quality,
) -> Result<Encoded, String> {
    let base = format!("{stem}.{}", content_hash(img));
    let avif = encode_avif(img, q)?;
    let webp = encode_webp(img, q)?;
    std::fs::create_dir_all(dir).map_err(|err| format!("{}: {err}", dir.display()))?;
    let save = |ext: &str, bytes: &[u8]| -> Result<String, String> {
        let name = format!("{base}.{ext}");
        let path = dir.join(&name);
        std::fs::write(&path, bytes).map_err(|err| format!("{}: {err}", path.display()))?;
        Ok(format!("{rel_dir}/{name}"))
    };
    Ok(Encoded {
        avif: save("avif", &avif)?,
        webp: save("webp", &webp)?,
    })
}

/// Пишет холст во всех размерах клетки: `<out>/<cell>/<stem>.<hash>.{avif,webp}`.
///
/// # Errors
/// Как у [`write`].
pub fn write_sizes(
    master: &RgbaImage,
    stem: &str,
    cell_sizes: &[u32],
    out: &Path,
    q: Quality,
) -> Result<BTreeMap<u32, Encoded>, String> {
    let mut files = BTreeMap::new();
    for &cell in cell_sizes {
        let rel_dir = cell.to_string();
        let img = render::scale(master, cell);
        files.insert(cell, write(&img, &out.join(&rel_dir), &rel_dir, stem, q)?);
    }
    Ok(files)
}

fn encode_avif(img: &RgbaImage, q: Quality) -> Result<Vec<u8>, String> {
    let (w, h) = img.dimensions();
    let pixels: Vec<RGBA8> = img
        .pixels()
        .map(|p| RGBA8::new(p.0[0], p.0[1], p.0[2], p.0[3]))
        .collect();
    let encoded = Encoder::new()
        .with_quality(q.avif)
        .with_alpha_quality(q.avif)
        .with_speed(q.avif_speed)
        .with_num_threads(Some(1))
        .encode_rgba(Img::new(pixels.as_slice(), w as usize, h as usize))
        .map_err(|err| format!("avif: {err}"))?;
    Ok(encoded.avif_file)
}

fn encode_webp(img: &RgbaImage, q: Quality) -> Result<Vec<u8>, String> {
    let (w, h) = img.dimensions();
    let encoder = webp::Encoder::from_rgba(img.as_raw(), w, h);
    let memory = encoder
        .encode_simple(false, q.webp)
        .map_err(|err| format!("webp: {err:?}"))?;
    Ok(memory.to_vec())
}

#[cfg(test)]
mod tests {
    use super::content_hash;
    use image::{Rgba, RgbaImage};

    #[test]
    fn hash_changes_with_pixels_only() {
        let a = RgbaImage::from_pixel(2, 2, Rgba([1, 2, 3, 255]));
        let b = RgbaImage::from_pixel(2, 2, Rgba([1, 2, 3, 255]));
        let c = RgbaImage::from_pixel(2, 2, Rgba([9, 2, 3, 255]));
        assert_eq!(content_hash(&a), content_hash(&b));
        assert_ne!(content_hash(&a), content_hash(&c));
        assert_eq!(content_hash(&a).len(), 10);
    }
}

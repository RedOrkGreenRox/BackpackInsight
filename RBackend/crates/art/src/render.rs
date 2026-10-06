//! Сведение слоёв в один холст «форма × клетка».
//!
//! Мастер-холст — 120 px на клетку, как в ContentKit с версии 1.0.
//! Картинка подгоняется к холсту: поворот, если лежит поперёк формы;
//! растяжение, если стороны отличаются в пределах допуска (рамки сумок, сдвиг на пару px);
//! иначе вписывание по центру с сохранением пропорций и предупреждением.

use image::imageops::{self, FilterType};
use image::RgbaImage;
use rbackend_core::Cell;
use std::path::PathBuf;

/// Пикселей на клетку в мастер-холсте.
pub const MASTER_CELL: u32 = 120;

/// Ширина и высота рамки формы в клетках.
pub fn shape_cells(shape: &[Cell]) -> (u32, u32) {
    let span = |values: &mut dyn Iterator<Item = i8>| {
        let (min, max) = values.fold((i8::MAX, i8::MIN), |(lo, hi), v| (lo.min(v), hi.max(v)));
        if min > max {
            1
        } else {
            u32::from(max.abs_diff(min)) + 1
        }
    };
    (
        span(&mut shape.iter().map(|c| c.x)),
        span(&mut shape.iter().map(|c| c.y)),
    )
}

/// Что сделано с картинкой при подгонке.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Fit {
    /// Размер совпал точно.
    Exact,
    /// Растянута в пределах допуска.
    Stretched { from: (u32, u32) },
    /// Вписана с полями — пропорции слишком далеки от формы.
    Letterboxed { from: (u32, u32) },
}

/// Сводит слои, поворачивает и подгоняет к холсту `cells × MASTER_CELL`.
///
/// # Errors
/// Слой не читается как PNG.
pub fn render(
    layers: &[PathBuf],
    cells: (u32, u32),
    rotate: Option<u16>,
    default_rotate: u16,
    tolerance: f32,
) -> Result<(RgbaImage, Fit), String> {
    let mut art = compose(layers)?;
    let target = (cells.0 * MASTER_CELL, cells.1 * MASTER_CELL);
    let degrees = rotate.or_else(|| crosswise(&art, target, tolerance).then_some(default_rotate));
    art = match degrees {
        Some(90) => imageops::rotate90(&art),
        Some(180) => imageops::rotate180(&art),
        Some(270) => imageops::rotate270(&art),
        _ => art,
    };
    let from = art.dimensions();
    if from == target {
        return Ok((art, Fit::Exact));
    }
    if aspect_gap(from, target) <= tolerance {
        let out = imageops::resize(&art, target.0, target.1, FilterType::Lanczos3);
        return Ok((out, Fit::Stretched { from }));
    }
    Ok((letterbox(&art, target), Fit::Letterboxed { from }))
}

/// Масштабирует мастер-холст к другому размеру клетки.
pub fn scale(master: &RgbaImage, cell: u32) -> RgbaImage {
    if cell == MASTER_CELL {
        return master.clone();
    }
    let (w, h) = master.dimensions();
    imageops::resize(
        master,
        w * cell / MASTER_CELL,
        h * cell / MASTER_CELL,
        FilterType::Lanczos3,
    )
}

fn compose(layers: &[PathBuf]) -> Result<RgbaImage, String> {
    let mut images = Vec::with_capacity(layers.len());
    for path in layers {
        let img = image::open(path).map_err(|err| format!("{}: {err}", path.display()))?;
        images.push(img.to_rgba8());
    }
    let width = images.iter().map(RgbaImage::width).max().unwrap_or(1);
    let height = images.iter().map(RgbaImage::height).max().unwrap_or(1);
    let mut canvas = RgbaImage::new(width, height);
    for layer in &images {
        let x = i64::from((width - layer.width()) / 2);
        let y = i64::from((height - layer.height()) / 2);
        imageops::overlay(&mut canvas, layer, x, y);
    }
    Ok(canvas)
}

/// Картинка лежит поперёк формы: после поворота пропорции сходятся, а без него нет.
fn crosswise(art: &RgbaImage, target: (u32, u32), tolerance: f32) -> bool {
    let size = art.dimensions();
    target.0 != target.1
        && aspect_gap(size, target) > tolerance
        && aspect_gap((size.1, size.0), target) <= tolerance
}

fn aspect_gap(from: (u32, u32), to: (u32, u32)) -> f32 {
    let ratio = |(w, h): (u32, u32)| w as f32 / h.max(1) as f32;
    (ratio(from) / ratio(to) - 1.0).abs()
}

fn letterbox(art: &RgbaImage, target: (u32, u32)) -> RgbaImage {
    let (w, h) = art.dimensions();
    let k = (target.0 as f32 / w as f32).min(target.1 as f32 / h as f32);
    let size = (
        ((w as f32 * k).round() as u32).max(1),
        ((h as f32 * k).round() as u32).max(1),
    );
    let fitted = imageops::resize(art, size.0, size.1, FilterType::Lanczos3);
    let mut canvas = RgbaImage::new(target.0, target.1);
    let x = i64::from((target.0 - size.0.min(target.0)) / 2);
    let y = i64::from((target.1 - size.1.min(target.1)) / 2);
    imageops::overlay(&mut canvas, &fitted, x, y);
    canvas
}

#[cfg(test)]
#[path = "render_tests.rs"]
mod tests;

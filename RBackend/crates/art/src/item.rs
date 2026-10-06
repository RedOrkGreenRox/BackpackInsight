//! Одна картинка предмета: слои → мастер-холст → все размеры и состояния.

use crate::build::BuildInput;
use crate::encode;
use crate::manifest::ItemArt;
use crate::render::{self, Fit};
use crate::resolve::Source;
use rbackend_core::{ItemDef, SlugService};
use std::collections::BTreeMap;
use std::path::PathBuf;

/// Рисует предмет и его состояния, пишет файлы; возвращает запись манифеста.
///
/// # Errors
/// Слой не читается или файл не записался.
pub fn render_item(
    item: &ItemDef,
    source: &Source,
    input: &BuildInput<'_>,
) -> Result<(String, ItemArt, Fit), String> {
    let cells = render::shape_cells(&item.item_shape);
    let slug = SlugService::to_slug(item.id.as_str()).to_string();
    let draw = |layers: &[PathBuf]| {
        let sources = &input.rules.sources;
        render::render(
            layers,
            cells,
            source.rotate,
            sources.default_rotate,
            sources.aspect_tolerance,
        )
        .map_err(|err| format!("{}: {err}", item.id))
    };
    let (master, fit) = draw(&source.layers)?;
    let images = encode::write_sizes(
        &master,
        &slug,
        &input.rules.sources.cell_sizes,
        input.out,
        input.quality,
    )?;
    let mut states = BTreeMap::new();
    for (state, path) in &source.states {
        let (state_master, _) = draw(std::slice::from_ref(path))?;
        let stem = format!("{slug}--{}", SlugService::to_slug(state.as_str()));
        states.insert(
            state.clone(),
            encode::write_sizes(
                &state_master,
                &stem,
                &input.rules.sources.cell_sizes,
                input.out,
                input.quality,
            )?,
        );
    }
    let rel = |path: &PathBuf| {
        path.strip_prefix(input.kit)
            .unwrap_or(path)
            .to_string_lossy()
            .replace('\\', "/")
    };
    let art = ItemArt {
        cells,
        images,
        states,
        fit: fit.clone().into(),
        source: source.layers.iter().map(rel).collect(),
    };
    Ok((item.id.clone(), art, fit))
}

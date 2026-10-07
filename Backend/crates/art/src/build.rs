//! Сборка: экспорт + архив + правила → картинки и `manifest.json`.
//!
//! Сначала резолвятся все предметы; если хоть один без картинки и без правила,
//! сборка падает со списком всех таких `id` и ничего не пишет.

use crate::encode::Quality;
use crate::item;
use crate::kit::KitIndex;
use crate::manifest::{ItemArt, Manifest};
use crate::render::Fit;
use crate::resolve::{Resolved, Resolver, Source};
use crate::rules::Rules;
use rayon::prelude::*;
use backend_core::{CatalogExport, ItemDef};
use std::collections::BTreeMap;
use std::path::Path;

/// Входы сборки.
pub struct BuildInput<'a> {
    /// Корень распакованного ContentKit (там `Items/`, `ui/`).
    pub kit: &'a Path,
    /// Экспорт предметов игры.
    pub export: &'a Path,
    /// Правила.
    pub rules: &'a Rules,
    /// Папка вывода.
    pub out: &'a Path,
    /// Качество кодирования.
    pub quality: Quality,
}

/// Итог сборки для печати.
#[derive(Debug)]
pub struct BuildReport {
    /// Предметов с картинкой.
    pub built: usize,
    /// Предметов, отмеченных в правилах как без картинки.
    pub missing: usize,
    /// Предметы, вписанные с полями (пропорции не сошлись).
    pub letterboxed: Vec<String>,
}

/// Собирает все картинки.
///
/// # Errors
/// Экспорт не читается, есть предметы без правил, или картинка не собралась.
pub fn build(input: &BuildInput<'_>) -> Result<BuildReport, String> {
    let bytes =
        std::fs::read(input.export).map_err(|err| format!("{}: {err}", input.export.display()))?;
    let export = CatalogExport::parse(&bytes).map_err(|err| err.to_string())?;
    let kit = KitIndex::scan(input.kit, &input.rules.sources.roots)?;
    let resolver = Resolver::new(&kit, input.rules);
    let (arts, missing) = resolve_all(&export.items, &resolver)?;

    // AVIF-кодер (rav1e) глубоко рекурсивен: стандартного стека рабочих потоков rayon ему мало.
    let pool = rayon::ThreadPoolBuilder::new()
        .stack_size(64 << 20)
        .build()
        .map_err(|err| err.to_string())?;
    let built: Vec<(String, ItemArt, Fit)> = pool.install(|| {
        arts.par_iter()
            .map(|(item, source)| item::render_item(item, source, input))
            .collect::<Result<_, _>>()
    })?;

    let letterboxed = built
        .iter()
        .filter(|(_, _, fit)| matches!(fit, Fit::Letterboxed { .. }))
        .map(|(id, _, _)| id.clone())
        .collect();
    let manifest = Manifest {
        game_version: export.app_version.clone(),
        cell_sizes: input.rules.sources.cell_sizes.clone(),
        items: built.into_iter().map(|(id, art, _)| (id, art)).collect(),
        missing,
    };
    manifest.write(input.out)?;
    Ok(BuildReport {
        built: manifest.items.len(),
        missing: manifest.missing.len(),
        letterboxed,
    })
}

type Resolution<'e> = (Vec<(&'e ItemDef, Source)>, BTreeMap<String, String>);

fn resolve_all<'e>(
    items: &'e [ItemDef],
    resolver: &Resolver<'_>,
) -> Result<Resolution<'e>, String> {
    let mut arts = Vec::new();
    let mut missing = BTreeMap::new();
    let mut errors = Vec::new();
    for item in items {
        match resolver.resolve(&item.id, &item.name) {
            Ok(Resolved::Art(source)) => arts.push((item, source)),
            Ok(Resolved::Missing(reason)) => {
                missing.insert(item.id.clone(), reason);
            }
            Err(err) => errors.push(err),
        }
    }
    if errors.is_empty() {
        Ok((arts, missing))
    } else {
        Err(format!(
            "{} item(s) without art:\n- {}",
            errors.len(),
            errors.join("\n- ")
        ))
    }
}

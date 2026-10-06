//! Загрузка предметов одного языка из `RBackend/generated/items_{lang}.json`.
//!
//! Файл пишет `builder build-catalog-json` после проверки экспорта игры строгой
//! моделью [`CatalogExport`]; здесь та же модель, так что расхождение формата — ошибка старта.

use super::CatalogItem;
use rbackend_core::{CatalogExport, ItemDef, ItemIconService};
use std::{collections::HashMap, fs, path::Path};

/// Читает каталог языка и превращает его предметы в [`CatalogItem`].
///
/// `images` — ключи картинок английского каталога по `id`. Для английского каталога
/// передаётся `None`, и ключ считается здесь: `ItemIconService` опирается на
/// английский текст первого тултипа (`Step N` у планов ограбления).
///
/// # Errors
/// Файла нет или он не совпадает с моделью экспорта.
pub fn load_items(
    path: &Path,
    images: Option<&HashMap<String, String>>,
) -> Result<Vec<CatalogItem>, String> {
    let bytes =
        fs::read(path).map_err(|err| format!("could not read {}: {err}", path.display()))?;
    let export =
        CatalogExport::parse(&bytes).map_err(|err| format!("{}: {err}", path.display()))?;
    Ok(export
        .items
        .into_iter()
        .map(|def| {
            let image = images
                .and_then(|map| map.get(&def.id))
                .cloned()
                .unwrap_or_else(|| image_key(&def));
            CatalogItem::new(def, image)
        })
        .collect())
}

fn image_key(def: &ItemDef) -> String {
    let tooltip = def.tooltips.first().map(String::as_str);
    ItemIconService::image_key(def.id.as_str(), Some(def.rarity.as_str()), tooltip).to_string()
}

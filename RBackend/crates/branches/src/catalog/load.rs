//! Загрузка предметов одного языка из `RBackend/generated/items_{lang}.json`.
//!
//! Файл пишет `builder build-catalog-json` после проверки экспорта игры строгой
//! моделью [`CatalogExport`]; здесь та же модель, так что расхождение формата — ошибка старта.

use super::{art::ArtIndex, CatalogItem};
use rbackend_core::CatalogExport;
use std::{fs, path::Path};

/// Читает каталог языка и превращает его предметы в [`CatalogItem`].
///
/// Картинка берётся из манифеста `art` по `id` — он одинаков во всех языках.
///
/// # Errors
/// Файла нет или он не совпадает с моделью экспорта.
pub fn load_items(path: &Path, art: &ArtIndex) -> Result<Vec<CatalogItem>, String> {
    let bytes =
        fs::read(path).map_err(|err| format!("could not read {}: {err}", path.display()))?;
    let export =
        CatalogExport::parse(&bytes).map_err(|err| format!("{}: {err}", path.display()))?;
    Ok(export
        .items
        .into_iter()
        .map(|def| {
            let image = art.get(&def.id);
            CatalogItem::new(def, image)
        })
        .collect())
}

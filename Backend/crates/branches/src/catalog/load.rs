//! Загрузка предметов одного языка из `Backend/generated/items_{lang}.json`.
//!
//! Файл пишет `builder build-catalog-json` после проверки экспорта игры строгой
//! моделью [`CatalogExport`]; здесь та же модель, так что расхождение формата — ошибка старта.

use super::{art::ArtIndex, item::PLACED_STATE, CatalogItem, LangCatalog};
use backend_core::CatalogExport;
use std::{fs, path::Path};

/// Читает каталог языка: предметы — в [`CatalogItem`], версия игры — из `appVersion`.
///
/// Картинка и картинка поставленной сумки берутся из манифеста `art` по `id` — он одинаков во всех языках.
///
/// # Errors
/// Файла нет или он не совпадает с моделью экспорта.
pub fn load_lang(path: &Path, art: &ArtIndex) -> Result<LangCatalog, String> {
    let bytes =
        fs::read(path).map_err(|err| format!("could not read {}: {err}", path.display()))?;
    let export =
        CatalogExport::parse(&bytes).map_err(|err| format!("{}: {err}", path.display()))?;
    let items = export
        .items
        .into_iter()
        .map(|def| {
            let image = art.get(&def.id);
            let placed = art.state(&def.id, PLACED_STATE);
            CatalogItem::new(def, image).with_placed(placed)
        })
        .collect();
    Ok(LangCatalog::new(items).with_version(export.app_version))
}

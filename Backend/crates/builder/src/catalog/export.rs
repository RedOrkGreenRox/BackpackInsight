//! Каталог для сайта: экспорт игры, проверенный строгой моделью `backend_core::CatalogExport`
//! и записанный в `Backend/generated/items_{lang}.json`.

use crate::catalog::files::localized_files;
use backend_core::CatalogExport;
use std::{
    collections::BTreeSet,
    fs,
    path::{Path, PathBuf},
};

/// Языки каталога в порядке записи.
const LANGS: [&str; 2] = ["en", "ru"];

/// Путь нормализованного каталога языка `lang`.
#[must_use]
pub fn generated_path(project_root: &Path, lang: &str) -> PathBuf {
    project_root.join(format!("Backend/generated/items_{lang}.json"))
}

/// Проверяет оба экспорта моделью, сверяет наборы `id` и пишет нормализованные копии.
///
/// # Errors
/// Экспорт не читается или не совпадает с моделью, у языков разные предметы,
/// файл не записывается.
pub fn build_catalog_json(project_root: &Path) -> Result<Vec<PathBuf>, String> {
    let (en, ru) = localized_files(project_root);
    let exports = [read(&en)?, read(&ru)?];
    same_ids(&exports[0], &exports[1])?;
    let mut written = Vec::with_capacity(LANGS.len());
    for (lang, export) in LANGS.into_iter().zip(&exports) {
        let path = generated_path(project_root, lang);
        if let Some(dir) = path.parent() {
            fs::create_dir_all(dir)
                .map_err(|err| format!("could not create {}: {err}", dir.display()))?;
        }
        let bytes = serde_json::to_vec(export).map_err(|err| format!("{lang}: {err}"))?;
        fs::write(&path, bytes)
            .map_err(|err| format!("could not write {}: {err}", path.display()))?;
        written.push(path);
    }
    Ok(written)
}

/// Перечитывает записанные каталоги моделью; возвращает число предметов по языкам.
///
/// # Errors
/// Файла нет или он не совпадает с моделью.
pub fn verify_catalog_json(project_root: &Path) -> Result<Vec<(&'static str, usize)>, String> {
    LANGS
        .into_iter()
        .map(|lang| Ok((lang, read(&generated_path(project_root, lang))?.items.len())))
        .collect()
}

fn read(path: &Path) -> Result<CatalogExport, String> {
    let bytes =
        fs::read(path).map_err(|err| format!("could not read {}: {err}", path.display()))?;
    CatalogExport::parse(&bytes).map_err(|err| format!("{}: {err}", path.display()))
}

fn same_ids(en: &CatalogExport, ru: &CatalogExport) -> Result<(), String> {
    let ids = |export: &CatalogExport| -> BTreeSet<String> {
        export.items.iter().map(|item| item.id.clone()).collect()
    };
    let (en_ids, ru_ids) = (ids(en), ids(ru));
    let only_en = en_ids.difference(&ru_ids).count();
    let only_ru = ru_ids.difference(&en_ids).count();
    if only_en == 0 && only_ru == 0 && en_ids.len() == en.items.len() {
        Ok(())
    } else {
        Err(format!(
            "catalog languages differ: {only_en} ids only in en, {only_ru} only in ru, \
             {} duplicate ids in en",
            en.items.len() - en_ids.len()
        ))
    }
}

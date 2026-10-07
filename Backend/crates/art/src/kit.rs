//! Индекс картинок распакованного ContentKit: имя файла → путь.
//!
//! Папка героя в ключ не входит: от версии к версии предметы переезжают
//! между папками (`Items/Shared` → `Items/Fern`), а имя файла остаётся.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

/// Картинки архива, сгруппированные по нормализованному имени файла.
#[derive(Debug, Default)]
pub struct KitIndex {
    files: BTreeMap<String, Vec<PathBuf>>,
}

impl KitIndex {
    /// Обходит `roots` внутри `kit` и собирает все `.png`.
    ///
    /// # Errors
    /// Ни одна из папок `roots` не найдена или каталог не читается.
    pub fn scan(kit: &Path, roots: &[String]) -> Result<Self, String> {
        let mut index = Self::default();
        let mut found_any = false;
        for root in roots {
            let dir = kit.join(root);
            if dir.is_dir() {
                found_any = true;
                index.walk(&dir)?;
            }
        }
        if found_any {
            Ok(index)
        } else {
            Err(format!("none of {roots:?} found in {}", kit.display()))
        }
    }

    fn walk(&mut self, dir: &Path) -> Result<(), String> {
        let entries = std::fs::read_dir(dir)
            .map_err(|err| format!("cannot read {}: {err}", dir.display()))?;
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                self.walk(&path)?;
            } else if is_png(&path) {
                if let Some(stem) = path.file_stem().and_then(|stem| stem.to_str()) {
                    self.files
                        .entry(stem_key(stem))
                        .or_default()
                        .push(path.clone());
                }
            }
        }
        Ok(())
    }

    /// Все файлы с таким именем (без учёта регистра, пробелов и знаков).
    pub fn find(&self, stem: &str) -> &[PathBuf] {
        self.files.get(&stem_key(stem)).map_or(&[], Vec::as_slice)
    }

    /// Ровно один файл с таким именем.
    ///
    /// # Errors
    /// Файла нет или их несколько.
    pub fn one(&self, stem: &str) -> Result<&Path, String> {
        match self.find(stem) {
            [single] => Ok(single),
            [] => Err(format!("no file \"{stem}\"")),
            many => Err(format!("\"{stem}\" is ambiguous: {many:?}")),
        }
    }

    /// Все найденные файлы (для поиска картинок без предмета).
    pub fn paths(&self) -> impl Iterator<Item = &Path> {
        self.files.values().flatten().map(PathBuf::as_path)
    }
}

/// Ключ сравнения имён: `Bosun's Monocular` и `bosuns monocular` совпадают.
pub fn stem_key(stem: &str) -> String {
    stem.chars()
        .filter(char::is_ascii_alphanumeric)
        .map(|ch| ch.to_ascii_lowercase())
        .collect()
}

fn is_png(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .is_some_and(|ext| ext.eq_ignore_ascii_case("png"))
}

#[cfg(test)]
mod tests {
    use super::stem_key;

    #[test]
    fn stem_key_ignores_case_and_punctuation() {
        assert_eq!(stem_key("Bosun's Monocular"), stem_key("bosuns monocular"));
        assert_eq!(stem_key("Vitri-Oil Vault Drill"), "vitrioilvaultdrill");
    }
}

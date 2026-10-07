//! Картинки предметов из `Frontend/Web/static/images/art/manifest.json`.
//!
//! Манифест пишет крейт `art` (`art build`): картинка предмета ищется по его `id`,
//! без угадывания имён файлов. Предмета нет в манифесте — карточка покажет заглушку.

use crate::model::ItemImage;
use serde::Deserialize;
use std::{collections::HashMap, fs, path::Path};

/// Папка картинок внутри `/images` (и внутри `Frontend/Web/static/images`).
pub const ART_DIR: &str = "art";
/// Клетка обычной плотности и клетка для экранов 2x, px.
const CELL_1X: u32 = 60;
const CELL_2X: u32 = 120;

/// `id` предмета → пути к картинке и к картинкам его состояний.
#[derive(Debug, Default)]
pub struct ArtIndex {
    images: HashMap<String, ItemImage>,
    /// `(id, состояние)` → картинка: `open` у сумок, `Empty` у бутылок.
    states: HashMap<(String, String), ItemImage>,
}

#[derive(Deserialize)]
struct Manifest {
    items: HashMap<String, ManifestItem>,
}

#[derive(Deserialize)]
struct ManifestItem {
    images: HashMap<u32, Files>,
    #[serde(default)]
    states: HashMap<String, HashMap<u32, Files>>,
}

#[derive(Deserialize)]
struct Files {
    avif: String,
}

impl ArtIndex {
    /// Читает манифест.
    ///
    /// # Errors
    /// Файла нет или он не разбирается.
    pub fn load(path: &Path) -> Result<Self, String> {
        let bytes =
            fs::read(path).map_err(|err| format!("could not read {}: {err}", path.display()))?;
        let manifest: Manifest =
            serde_json::from_slice(&bytes).map_err(|err| format!("{}: {err}", path.display()))?;
        let mut index = Self::default();
        for (id, item) in manifest.items {
            for (state, files) in &item.states {
                if let Some(img) = image(files) {
                    index.states.insert((id.clone(), state.clone()), img);
                }
            }
            if let Some(img) = image(&item.images) {
                index.images.insert(id, img);
            }
        }
        Ok(index)
    }

    /// Картинка предмета; пустая, если её нет.
    #[must_use]
    pub fn get(&self, id: &str) -> ItemImage {
        self.images.get(id).cloned().unwrap_or_default()
    }

    /// Картинка состояния `state` предмета; пустая, если такого состояния нет.
    #[must_use]
    pub fn state(&self, id: &str, state: &str) -> ItemImage {
        self.states
            .get(&(id.to_owned(), state.to_owned()))
            .cloned()
            .unwrap_or_default()
    }
}

/// `60/abyssal-embrace.3f2a1c9d0e.avif` → `art/60/abyssal-embrace.3f2a1c9d0e` (расширение добавит карточка).
fn image(files: &HashMap<u32, Files>) -> Option<ItemImage> {
    let stem = |cell: u32| {
        let avif = &files.get(&cell)?.avif;
        Some(format!("{ART_DIR}/{}", avif.strip_suffix(".avif")?))
    };
    Some(ItemImage {
        x1: stem(CELL_1X)?,
        x2: stem(CELL_2X)?,
    })
}

#[cfg(test)]
mod tests {
    use super::ArtIndex;

    #[test]
    fn reads_both_densities_and_defaults_to_empty() {
        let dir = std::env::temp_dir().join(format!("branches-art-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap_or_else(|err| panic!("{err}"));
        let path = dir.join("manifest.json");
        let json = r#"{"game_version":"7.0.0","items":{"Apple":{"cells":[1,1],"images":{
            "60":{"avif":"60/apple.aa.avif","webp":"60/apple.aa.webp"},
            "120":{"avif":"120/apple.bb.avif","webp":"120/apple.bb.webp"}},
            "states":{"open":{"60":{"avif":"60/apple--open.cc.avif","webp":"60/apple--open.cc.webp"},
            "120":{"avif":"120/apple--open.dd.avif","webp":"120/apple--open.dd.webp"}}}}}}"#;
        std::fs::write(&path, json).unwrap_or_else(|err| panic!("{err}"));
        let index = ArtIndex::load(&path).unwrap_or_else(|err| panic!("{err}"));
        let _ = std::fs::remove_dir_all(&dir);
        assert_eq!(index.get("Apple").x1, "art/60/apple.aa");
        assert_eq!(index.get("Apple").x2, "art/120/apple.bb");
        assert!(index.get("Pear").is_empty());
        assert_eq!(index.state("Apple", "open").x2, "art/120/apple--open.dd");
        assert!(index.state("Apple", "Empty").is_empty());
    }
}

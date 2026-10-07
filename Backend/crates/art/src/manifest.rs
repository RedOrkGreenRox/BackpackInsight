//! `manifest.json` — единственная связь сайта с картинками.
//!
//! Сайт ничего не угадывает: берёт `id` предмета и читает отсюда файлы.

use crate::encode::Encoded;
use crate::render::Fit;
use serde::Serialize;
use std::collections::BTreeMap;
use std::path::Path;

/// Файл целиком.
#[derive(Debug, Serialize)]
pub struct Manifest {
    /// Версия игры из экспорта (`7.0.0`).
    pub game_version: String,
    /// Размеры клетки, для которых есть файлы.
    pub cell_sizes: Vec<u32>,
    /// `id` предмета → картинка.
    pub items: BTreeMap<String, ItemArt>,
    /// `id` предмета → почему картинки нет (из правил).
    pub missing: BTreeMap<String, String>,
}

/// Картинка одного предмета.
#[derive(Debug, Serialize)]
pub struct ItemArt {
    /// Ширина и высота формы в клетках.
    pub cells: (u32, u32),
    /// Размер клетки → файлы.
    pub images: BTreeMap<u32, Encoded>,
    /// Состояние (`Empty`, `open`) → размер клетки → файлы.
    #[serde(skip_serializing_if = "BTreeMap::is_empty")]
    pub states: BTreeMap<String, BTreeMap<u32, Encoded>>,
    /// Как исходник подогнан к форме.
    pub fit: FitNote,
    /// Исходные файлы относительно корня архива, снизу вверх.
    pub source: Vec<String>,
}

/// [`Fit`] для JSON.
#[derive(Debug, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum FitNote {
    /// Размер совпал.
    Exact,
    /// Растянута из `from`.
    Stretched { from: (u32, u32) },
    /// Вписана с полями из `from`.
    Letterboxed { from: (u32, u32) },
}

impl From<Fit> for FitNote {
    fn from(fit: Fit) -> Self {
        match fit {
            Fit::Exact => Self::Exact,
            Fit::Stretched { from } => Self::Stretched { from },
            Fit::Letterboxed { from } => Self::Letterboxed { from },
        }
    }
}

impl Manifest {
    /// Пишет `<out>/manifest.json` с отступами (удобно смотреть в diff).
    ///
    /// # Errors
    /// Файл не записался.
    pub fn write(&self, out: &Path) -> Result<(), String> {
        let path = out.join("manifest.json");
        let json = serde_json::to_string_pretty(self).map_err(|err| err.to_string())?;
        std::fs::write(&path, json + "\n").map_err(|err| format!("{}: {err}", path.display()))
    }
}

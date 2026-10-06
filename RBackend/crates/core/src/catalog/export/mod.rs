//! Экспорт каталога из игры в строгих типах.
//!
//! Источник — `items_{lang}_X_Y_Z.json`. `builder` проверяет его этой моделью
//! и пишет нормализованную копию в `RBackend/generated/items_{lang}.json`,
//! а сайт читает ту же модель при старте.

mod item;
mod parts;
mod rarity;
#[cfg(test)]
mod tests;

pub use item::ItemDef;
pub use parts::{Cell, CombatStats, LevelChange, Levels, Recipe};

use serde::{Deserialize, Serialize};
use std::fmt;

/// Файл экспорта целиком: заголовок версии и предметы.
#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CatalogExport {
    /// Версия игры (`5.1.0`).
    pub app_version: String,
    /// Номер сборки игры.
    pub build_number: String,
    /// Когда сделан экспорт.
    pub export_date: String,
    /// Язык, как его записал экспорт (у RU-файла 5.1.0 ошибочно `en`).
    pub language: String,
    /// Включены ли в экспорт скрытые предметы.
    pub embargoed: bool,
    /// Сколько предметов заявлено.
    pub item_count: usize,
    /// Предметы.
    pub items: Vec<ItemDef>,
}

impl CatalogExport {
    /// Разбирает экспорт и сверяет заявленное число предметов с фактическим.
    ///
    /// # Errors
    /// [`ExportError::Json`] — JSON не совпадает с моделью;
    /// [`ExportError::Count`] — `itemCount` не равен длине `items`.
    pub fn parse(bytes: &[u8]) -> Result<Self, ExportError> {
        let export: Self = serde_json::from_slice(bytes).map_err(ExportError::Json)?;
        if export.item_count == export.items.len() {
            Ok(export)
        } else {
            Err(ExportError::Count {
                declared: export.item_count,
                actual: export.items.len(),
            })
        }
    }
}

/// Почему экспорт не принят.
#[derive(Debug)]
pub enum ExportError {
    /// JSON битый или не совпадает с моделью (незнакомое поле, редкость, тип значения).
    Json(serde_json::Error),
    /// `itemCount` не совпадает с числом предметов.
    Count {
        /// Значение `itemCount`.
        declared: usize,
        /// Длина `items`.
        actual: usize,
    },
}

impl fmt::Display for ExportError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Json(err) => write!(f, "item export does not match the model: {err}"),
            Self::Count { declared, actual } => {
                write!(f, "item export declares {declared} items but has {actual}")
            }
        }
    }
}

impl std::error::Error for ExportError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Json(err) => Some(err),
            Self::Count { .. } => None,
        }
    }
}

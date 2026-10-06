//! Правила сопоставления картинок предметам (`crates/art/rules.toml`).
//!
//! Оригиналы игры (ContentKit и экспорт предметов) никогда не меняются:
//! все поправки живут здесь и применяются к любой следующей версии архива.

use serde::Deserialize;
use std::collections::BTreeMap;
use std::path::Path;

/// Файл правил целиком.
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Rules {
    /// Где в архиве искать картинки и как их нормализовать.
    pub sources: Sources,
    /// `id` предмета → имя файла в архиве (без папки и `.png`), когда имена расходятся.
    #[serde(default)]
    pub alias: BTreeMap<String, String>,
    /// `id` предмета → слои снизу вверх (имена файлов без папки и `.png`).
    #[serde(default)]
    pub layers: BTreeMap<String, Vec<String>>,
    /// `id` предмета → поворот в градусах по часовой (90, 180, 270).
    #[serde(default)]
    pub rotate: BTreeMap<String, u16>,
    /// `id` предмета → почему картинки нет в архиве. Такие предметы не роняют сборку.
    #[serde(default)]
    pub missing: BTreeMap<String, String>,
    /// Этапы ограблений Hob: свиток шага + штамп темы.
    #[serde(default)]
    pub heist: Option<Heist>,
}

/// Источники и параметры нормализации.
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Sources {
    /// Папки внутри архива, где лежат картинки предметов (`Items`, `ui/Icons/Boons`).
    pub roots: Vec<String>,
    /// Суффиксы файлов-состояний: `Antivenom Empty`, `Medium Bag open`.
    pub states: Vec<String>,
    /// Размеры клетки на выходе, px (`[60, 120]`).
    pub cell_sizes: Vec<u32>,
    /// Насколько соотношение сторон картинки может отличаться от формы (0.08 = 8%).
    pub aspect_tolerance: f32,
    /// Поворот по умолчанию, если картинка лежит поперёк формы.
    pub default_rotate: u16,
}

/// Шаблон этапов ограбления: `Boomscrolling II` = свиток `Heist Plan 2` + штамп `Heist Plan - Scroll`.
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Heist {
    /// Имя файла свитка, `{step}` — номер шага арабскими цифрами.
    pub plan: String,
    /// Имя файла штампа, `{theme}` — тема из `themes`.
    pub stamp: String,
    /// Название ограбления (поле `name`) → тема штампа.
    pub themes: BTreeMap<String, String>,
}

impl Rules {
    /// Читает и разбирает файл правил.
    ///
    /// # Errors
    /// Файл не читается или не совпадает с моделью (неизвестный ключ, тип значения).
    pub fn load(path: &Path) -> Result<Self, String> {
        let text = std::fs::read_to_string(path)
            .map_err(|err| format!("cannot read rules {}: {err}", path.display()))?;
        Self::parse(&text).map_err(|err| format!("{}: {err}", path.display()))
    }

    /// Разбирает правила из строки TOML.
    ///
    /// # Errors
    /// Текст не совпадает с моделью.
    pub fn parse(text: &str) -> Result<Self, String> {
        let rules: Self = toml::from_str(text).map_err(|err| err.to_string())?;
        for (id, degrees) in &rules.rotate {
            if !matches!(degrees, 90 | 180 | 270) {
                return Err(format!("rotate.{id}: {degrees} is not 90, 180 or 270"));
            }
        }
        if rules.sources.cell_sizes.is_empty() {
            return Err("sources.cell_sizes is empty".to_owned());
        }
        Ok(rules)
    }
}

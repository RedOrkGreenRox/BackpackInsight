//! Какие файлы архива составляют картинку предмета.
//!
//! Порядок: `missing` → этап ограбления → `layers` → `alias` → имя файла = `id` → = `name`.

use crate::kit::KitIndex;
use crate::rules::{Heist, Rules};
use std::collections::BTreeMap;
use std::path::PathBuf;

/// Что нашлось для одного предмета.
#[derive(Debug, PartialEq, Eq)]
pub enum Resolved {
    /// Картинка собрана из файлов архива.
    Art(Source),
    /// В правилах записано, что картинки нет (с причиной).
    Missing(String),
}

/// Слои картинки и её состояния.
#[derive(Debug, PartialEq, Eq)]
pub struct Source {
    /// Слои снизу вверх; у обычного предмета один.
    pub layers: Vec<PathBuf>,
    /// Явный поворот из правил.
    pub rotate: Option<u16>,
    /// Состояние (`Empty`, `open`) → файл.
    pub states: BTreeMap<String, PathBuf>,
}

/// Ищет картинки предметов по правилам.
pub struct Resolver<'a> {
    kit: &'a KitIndex,
    rules: &'a Rules,
}

impl<'a> Resolver<'a> {
    /// Резолвер над индексом архива и правилами.
    pub fn new(kit: &'a KitIndex, rules: &'a Rules) -> Self {
        Self { kit, rules }
    }

    /// Файлы для предмета с данными `id` и `name`.
    ///
    /// # Errors
    /// Ни одно правило не подошло — значит, предмет новый и ему нужна строка в `rules.toml`.
    pub fn resolve(&self, id: &str, name: &str) -> Result<Resolved, String> {
        if let Some(reason) = self.rules.missing.get(id) {
            return Ok(Resolved::Missing(reason.clone()));
        }
        let stems = self.stems(id, name)?;
        let layers = stems
            .iter()
            .map(|stem| self.kit.one(stem).map(PathBuf::from))
            .collect::<Result<Vec<_>, _>>()
            .map_err(|err| format!("{id}: {err}"))?;
        let states = match stems.as_slice() {
            [single] => self.states(single),
            _ => BTreeMap::new(),
        };
        let rotate = self.rules.rotate.get(id).copied();
        Ok(Resolved::Art(Source {
            layers,
            rotate,
            states,
        }))
    }

    fn stems(&self, id: &str, name: &str) -> Result<Vec<String>, String> {
        if let Some(stems) = self
            .rules
            .heist
            .as_ref()
            .and_then(|heist| heist_layers(heist, id, name))
        {
            return Ok(stems);
        }
        if let Some(layers) = self.rules.layers.get(id) {
            return Ok(layers.clone());
        }
        if let Some(alias) = self.rules.alias.get(id) {
            return Ok(vec![alias.clone()]);
        }
        for candidate in [id, name] {
            if !self.kit.find(candidate).is_empty() {
                return Ok(vec![candidate.to_owned()]);
            }
        }
        Err(format!("{id}: no image and no rule (add it to rules.toml)"))
    }

    fn states(&self, stem: &str) -> BTreeMap<String, PathBuf> {
        let mut states = BTreeMap::new();
        for suffix in &self.rules.sources.states {
            if let Ok(path) = self.kit.one(&format!("{stem} {suffix}")) {
                states.insert(suffix.clone(), path.to_path_buf());
            }
        }
        states
    }
}

/// `Boomscrolling III` с `name = Boomscrolling` → [`Heist Plan 3`, `Heist Plan - Scroll`].
fn heist_layers(heist: &Heist, id: &str, name: &str) -> Option<Vec<String>> {
    let theme = heist.themes.get(name)?;
    let roman = id.strip_prefix(name)?.trim();
    let step = roman_step(roman)?;
    Some(vec![
        heist.plan.replace("{step}", &step.to_string()),
        heist.stamp.replace("{theme}", theme),
    ])
}

fn roman_step(roman: &str) -> Option<u8> {
    match roman {
        "I" => Some(1),
        "II" => Some(2),
        "III" => Some(3),
        "IV" => Some(4),
        _ => None,
    }
}

#[cfg(test)]
#[path = "resolve_tests.rs"]
mod tests;

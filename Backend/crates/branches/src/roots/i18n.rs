//! `Dict` — словари интерфейса, общие с TS-фронтендом (`Frontend/Web/static/lang/{en,ru}.json`).
//!
//! Подстановки как в `ground/localization/i18n.ts`: именованные `{{name}}` и позиционные `{0}`.

use crate::model::Lang;
use std::{collections::HashMap, path::Path, sync::Arc};

/// Словари всех языков; дёшево клонируется.
#[derive(Clone, Debug, Default)]
pub struct Dict(Arc<HashMap<Lang, HashMap<String, String>>>);

impl Dict {
    /// Читает `{project_root}/Frontend/Web/static/lang/{code}.json` для каждого языка.
    ///
    /// # Errors
    /// Файл словаря не читается или это не JSON-объект строк.
    pub fn load(project_root: &Path) -> Result<Self, String> {
        let dir = project_root.join("Frontend/Web/static/lang");
        let mut all = HashMap::new();
        for lang in Lang::ALL {
            let path = dir.join(format!("{}.json", lang.code()));
            let raw = std::fs::read_to_string(&path)
                .map_err(|err| format!("could not read {}: {err}", path.display()))?;
            let map: HashMap<String, String> = serde_json::from_str(&raw)
                .map_err(|err| format!("invalid {}: {err}", path.display()))?;
            all.insert(lang, map);
        }
        Ok(Self(Arc::new(all)))
    }

    /// Перевод ключа; если его нет — английский вариант, если нет и его — сам ключ.
    #[must_use]
    pub fn t(&self, lang: Lang, key: &str) -> String {
        self.lookup(lang, key)
            .or_else(|| self.lookup(Lang::En, key))
            .unwrap_or(key)
            .to_string()
    }

    /// Перевод с подстановкой: `("itemName", "Sorcerat")` для `{{itemName}}`, `("0", "5")` для `{0}`.
    #[must_use]
    pub fn tf(&self, lang: Lang, key: &str, args: &[(&str, &str)]) -> String {
        args.iter().fold(self.t(lang, key), |text, (name, value)| {
            text.replace(&format!("{{{{{name}}}}}"), value)
                .replace(&format!("{{{name}}}"), value)
        })
    }

    fn lookup(&self, lang: Lang, key: &str) -> Option<&str> {
        self.0.get(&lang)?.get(key).map(String::as_str)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn falls_back_and_substitutes() {
        let mut en = HashMap::new();
        en.insert("hi".to_string(), "Hi {{name}}, {0}".to_string());
        let mut all = HashMap::new();
        all.insert(Lang::En, en);
        all.insert(Lang::Ru, HashMap::new());
        let dict = Dict(Arc::new(all));
        assert_eq!(
            dict.tf(Lang::Ru, "hi", &[("name", "Иван"), ("0", "5")]),
            "Hi Иван, 5"
        );
        assert_eq!(dict.t(Lang::Ru, "missing"), "missing");
    }
}

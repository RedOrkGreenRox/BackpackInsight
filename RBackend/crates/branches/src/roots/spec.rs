//! `BranchSpec` — декларативный контракт ветки: имя, путь, острова, участие в sitemap.

/// Параметры пути, извлечённые по шаблону (`:slug` → значение).
pub type Params = Vec<(&'static str, String)>;

/// Контракт ветки. Из него `BranchRunner` строит маршрут Axum, а `Gen` — выбор ветки.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct BranchSpec {
    /// Имя ветки (`ItemsBranch`), попадает в `data-branch` у `<main>`.
    pub name: &'static str,
    /// Шаблон пути: статические сегменты и параметры `:name`.
    pub path: &'static str,
    /// Острова, которые ветка оживляет в браузере (для документации и аудита веса).
    pub islands: &'static [&'static str],
    /// Попадает ли путь в sitemap как отдельная страница.
    pub sitemap: bool,
}

impl BranchSpec {
    /// Сопоставляет путь запроса с шаблоном. Пустые сегменты (`//`, хвостовой `/`) игнорируются.
    #[must_use]
    pub fn matches(&self, path: &str) -> Option<Params> {
        let pattern: Vec<&'static str> = segments(self.path).collect();
        let actual: Vec<&str> = segments(path).collect();
        if pattern.len() != actual.len() {
            return None;
        }
        let mut params = Params::new();
        for (expected, value) in pattern.into_iter().zip(actual) {
            match expected.strip_prefix(':') {
                Some(name) => params.push((name, value.to_string())),
                None if expected == value => {}
                None => return None,
            }
        }
        Some(params)
    }

    /// Путь в синтаксисе Axum 0.8: `/item/:slug` → `/item/{slug}`.
    #[must_use]
    pub fn axum_path(&self) -> String {
        let parts: Vec<String> = segments(self.path)
            .map(|segment| match segment.strip_prefix(':') {
                Some(name) => format!("{{{name}}}"),
                None => segment.to_string(),
            })
            .collect();
        format!("/{}", parts.join("/"))
    }
}

fn segments(path: &str) -> impl Iterator<Item = &str> {
    path.split('/').filter(|segment| !segment.is_empty())
}

#[cfg(test)]
mod tests {
    use super::BranchSpec;

    const ITEM: BranchSpec = BranchSpec {
        name: "Item",
        path: "/item/:slug",
        islands: &[],
        sitemap: true,
    };
    const HOME: BranchSpec = BranchSpec {
        name: "Home",
        path: "/",
        islands: &[],
        sitemap: true,
    };

    #[test]
    fn extracts_params_and_ignores_trailing_slash() {
        assert_eq!(
            ITEM.matches("/item/sorcerat/"),
            Some(vec![("slug", "sorcerat".to_string())])
        );
        assert_eq!(ITEM.matches("/items/sorcerat"), None);
        assert_eq!(HOME.matches("/"), Some(vec![]));
        assert_eq!(HOME.matches("/items"), None);
    }

    #[test]
    fn converts_to_axum_syntax() {
        assert_eq!(ITEM.axum_path(), "/item/{slug}");
        assert_eq!(HOME.axum_path(), "/");
    }
}

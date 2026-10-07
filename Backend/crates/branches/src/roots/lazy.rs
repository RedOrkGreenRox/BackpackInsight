//! `LazyIslands` — подсказки браузеру о WASM ленивых островов (`#[island(lazy)]`).
//!
//! `cargo leptos build --split` выносит каждый ленивый остров в свой файл
//! `split_<остров>_loader_<хэш>.wasm` и пишет их список в `__wasm_split_manifest.json`.
//! Без подсказки браузер узнал бы о файле только после загрузки основного WASM.
//! Поэтому в `<head>` каждой страницы стоит `preload` каждого файла: с `media="all"`,
//! если остров есть на этой странице, и с `media="not all"`, если его нет. Такой
//! файл браузер сразу не грузит; его докачивает в простое
//! [`crate::shell::prefetch_lazy_islands`], уже после загрузки страницы.
//!
//! Набор ссылок одинаков на всех страницах намеренно: islands router сравнивает
//! старый и новый документ узел за узлом, и лишний `<link>` на одной странице сдвигал
//! это сравнение так, что при переходе терялся весь `<body>`.

use super::split_files::SplitFiles;
use leptos::{config::LeptosOptions, prelude::*};
use leptos_meta::Link;
use std::{collections::BTreeMap, fmt, path::PathBuf, sync::OnceLock};

/// Заглушка, которая остаётся в JS сайта, если ленивые острова собраны без `--split`.
const UNSPLIT_MARK: &str = "__wasm_split_placeholder__";

/// Сайт с ленивыми островами собран без `--split`: в браузере не заработает ни один остров.
#[derive(Debug)]
pub struct UnsplitBuild(PathBuf);

impl fmt::Display for UnsplitBuild {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{} собран без разбиения WASM; пересоберите: cargo leptos build --release --split",
            self.0.display()
        )
    }
}

impl std::error::Error for UnsplitBuild {}

/// Файл WASM одного ленивого острова.
struct Chunk {
    /// Ключ манифеста: `<остров>_loader_<хэш>`.
    key: String,
    /// Адрес файла на сайте.
    href: String,
}

/// Файлы и загрузчик. Пусто, если сайт собран без `--split`.
struct Split {
    loader: String,
    chunks: Vec<Chunk>,
}

static SPLIT: OnceLock<Split> = OnceLock::new();

/// Ленивые острова сайта.
pub struct LazyIslands;

impl LazyIslands {
    /// Читает манифест разбиения WASM один раз при старте сервера.
    ///
    /// # Errors
    /// [`UnsplitBuild`], если JS сайта собран без `--split`: такой сайт лучше не запускать.
    pub fn load(options: &LeptosOptions) -> Result<(), UnsplitBuild> {
        let pkg = options.site_pkg_dir.as_ref();
        let dir = PathBuf::from(options.site_root.as_ref()).join(pkg);
        let files = SplitFiles::resolve(options);
        let js = dir.join(&files.js);
        if std::fs::read_to_string(&js).is_ok_and(|code| code.contains(UNSPLIT_MARK)) {
            return Err(UnsplitBuild(js));
        }
        let path = dir.join(&files.manifest);
        // BTreeMap: порядок ссылок не зависит от запуска, а значит одинаков на всех страницах.
        let manifest = std::fs::read_to_string(path)
            .ok()
            .and_then(|raw| serde_json::from_str::<BTreeMap<String, Vec<String>>>(&raw).ok())
            .unwrap_or_default();
        let chunks = manifest
            .into_iter()
            .flat_map(|(key, files)| {
                files.into_iter().map(move |file| Chunk {
                    key: key.clone(),
                    href: format!("/{pkg}/{file}.wasm"),
                })
            })
            .collect();
        let loader = format!("/{pkg}/{}", files.loader);
        let _ = SPLIT.set(Split { loader, chunks });
        Ok(())
    }

    /// Ссылки в `<head>` для страницы с островами `islands` (вместе с островами каркаса).
    pub fn links(islands: &[&str]) -> impl IntoView {
        let split = SPLIT.get().filter(|split| !split.chunks.is_empty())?;
        let prefixes: Vec<String> = islands
            .iter()
            .map(|island| format!("{}_loader_", snake_case(island)))
            .collect();
        // Общий файл нескольких островов (`chunk_*`) ставится один раз; он нужен
        // странице, если нужен хоть одному её острову.
        let mut hrefs: Vec<(&str, bool)> = Vec::new();
        for chunk in &split.chunks {
            let used = prefixes.iter().any(|prefix| chunk.key.starts_with(prefix));
            match hrefs.iter_mut().find(|(href, _)| *href == chunk.href) {
                Some(entry) => entry.1 |= used,
                None => hrefs.push((&chunk.href, used)),
            }
        }
        let chunks = hrefs
            .into_iter()
            .map(|(href, used)| {
                let media = if used { "all" } else { "not all" };
                view! {
                    <Link rel="preload" href=href.to_owned() as_="fetch" type_="application/wasm" crossorigin="anonymous" media/>
                }
            })
            .collect_view();
        Some(view! {
            <Link rel="modulepreload" href=split.loader.clone() crossorigin="anonymous"/>
            {chunks}
        })
    }
}

/// `ItemsManager` → `items_manager`, как имена загрузчиков у `#[island(lazy)]`.
fn snake_case(name: &str) -> String {
    let mut out = String::with_capacity(name.len() + 4);
    for (i, ch) in name.chars().enumerate() {
        if ch.is_uppercase() {
            if i > 0 {
                out.push('_');
            }
            out.extend(ch.to_lowercase());
        } else {
            out.push(ch);
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::snake_case;

    #[test]
    fn island_names_become_loader_prefixes() {
        assert_eq!(snake_case("ItemsManager"), "items_manager");
        assert_eq!(snake_case("SidebarManager"), "sidebar_manager");
    }
}

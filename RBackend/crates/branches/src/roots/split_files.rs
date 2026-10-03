//! `SplitFiles` — имена файлов сайта, которые нужны ленивым островам, с учётом `hash-files`.
//!
//! При `hash-files` cargo-leptos добавляет к именам хэш и пишет его в файл хэшей рядом с
//! бинарником (`LeptosOptions::hash_file`) строками `ключ: хэш`. Leptos в `HydrationScripts`
//! читает этот файл так же; здесь те же правила, чтобы ссылки совпадали с его.

use leptos::config::LeptosOptions;
use std::collections::HashMap;

/// Имена файлов в каталоге `pkg`.
#[derive(Debug, PartialEq, Eq)]
pub struct SplitFiles {
    /// Основной JS сайта (`<output_name>.js`): по нему видно, собран ли сайт с `--split`.
    pub js: String,
    /// Манифест разбиения WASM.
    pub manifest: String,
    /// JS-загрузчик кусков WASM.
    pub loader: String,
}

impl SplitFiles {
    /// Имена для текущих настроек Leptos.
    #[must_use]
    pub fn resolve(options: &LeptosOptions) -> Self {
        let hashes = if options.hash_files {
            read_hashes(&options.hash_file)
        } else {
            HashMap::new()
        };
        Self::named(&options.output_name, &hashes)
    }

    /// Имена по таблице хэшей (`js`, `manifest`, `split`); нет хэша — имя без него.
    fn named(output_name: &str, hashes: &HashMap<String, String>) -> Self {
        let with_hash = |stem: &str, key: &str, ext: &str| match hashes.get(key) {
            Some(hash) => format!("{stem}.{hash}.{ext}"),
            None => format!("{stem}.{ext}"),
        };
        Self {
            js: with_hash(output_name, "js", "js"),
            manifest: with_hash("__wasm_split_manifest", "manifest", "json"),
            // Без хэша cargo-leptos ставит на его место подчёркивания.
            loader: match hashes.get("split") {
                Some(hash) => format!("__wasm_split.{hash}.js"),
                None => "__wasm_split.______________________.js".to_owned(),
            },
        }
    }
}

/// Файл хэшей рядом с бинарником; нет файла — пустая таблица.
fn read_hashes(hash_file: &str) -> HashMap<String, String> {
    let path = std::env::current_exe()
        .ok()
        .and_then(|exe| exe.parent().map(|dir| dir.join(hash_file)))
        .unwrap_or_default();
    std::fs::read_to_string(path)
        .unwrap_or_default()
        .lines()
        .filter_map(|line| line.trim().split_once(':'))
        .map(|(key, hash)| (key.trim().to_owned(), hash.trim().to_owned()))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::SplitFiles;
    use std::collections::HashMap;

    #[test]
    fn plain_names_without_hashes() {
        let files = SplitFiles::named("site", &HashMap::new());
        assert_eq!(files.js, "site.js");
        assert_eq!(files.manifest, "__wasm_split_manifest.json");
        assert_eq!(files.loader, "__wasm_split.______________________.js");
    }

    #[test]
    fn hashed_names_follow_hash_file() {
        let hashes = [("js", "a1"), ("manifest", "b2"), ("split", "c3")]
            .map(|(key, hash)| (key.to_owned(), hash.to_owned()))
            .into();
        let files = SplitFiles::named("site", &hashes);
        assert_eq!(files.js, "site.a1.js");
        assert_eq!(files.manifest, "__wasm_split_manifest.b2.json");
        assert_eq!(files.loader, "__wasm_split.c3.js");
    }
}

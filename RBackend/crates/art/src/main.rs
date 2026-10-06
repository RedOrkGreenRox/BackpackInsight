//! `art` — конвейер картинок предметов.
//!
//! ```text
//! art check --kit <ContentKit> --export <items.json> [--rules <rules.toml>]
//! art build --kit <ContentKit> --export <items.json> --out <dir> [--rules <rules.toml>]
//! ```
//! Оригиналы игры только читаются; все поправки — в `rules.toml`.

mod build;
mod check;
mod encode;
mod item;
mod kit;
mod manifest;
mod render;
mod resolve;
mod rules;
#[cfg(test)]
mod test_kit;

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

const DEFAULT_RULES: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/rules.toml");

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if let Err(err) = run(&args) {
        eprintln!("{err}");
        std::process::exit(1);
    }
}

fn run(args: &[String]) -> Result<(), String> {
    let (command, flags) = args.split_first().ok_or_else(usage)?;
    let flags = parse_flags(flags)?;
    let path = |key: &str| {
        flags
            .get(key)
            .map(PathBuf::from)
            .ok_or_else(|| format!("--{key} is required\n{}", usage()))
    };
    let rules_path = flags
        .get("rules")
        .map_or_else(|| PathBuf::from(DEFAULT_RULES), PathBuf::from);
    let rules = rules::Rules::load(&rules_path)?;
    let (kit, export) = (path("kit")?, path("export")?);
    match command.as_str() {
        "check" => {
            let report = check::check(&kit, &export, &rules)?;
            println!("{report}");
            Ok(())
        }
        "build" => {
            let out = path("out")?;
            prepare_out(&out)?;
            let input = build::BuildInput {
                kit: &kit,
                export: &export,
                rules: &rules,
                out: &out,
                quality: encode::Quality::default(),
            };
            let report = build::build(&input)?;
            println!(
                "art OK: built={} missing_by_rule={} out={}",
                report.built,
                report.missing,
                out.display()
            );
            if !report.letterboxed.is_empty() {
                println!(
                    "letterboxed (aspect far from shape): {}",
                    report.letterboxed.join(", ")
                );
            }
            Ok(())
        }
        other => Err(format!("unknown command {other}\n{}", usage())),
    }
}

fn parse_flags(flags: &[String]) -> Result<BTreeMap<String, String>, String> {
    let mut map = BTreeMap::new();
    let mut iter = flags.iter();
    while let Some(flag) = iter.next() {
        let key = flag
            .strip_prefix("--")
            .ok_or_else(|| format!("unexpected argument {flag}"))?;
        let value = iter
            .next()
            .ok_or_else(|| format!("--{key} needs a value"))?;
        map.insert(key.to_owned(), value.clone());
    }
    Ok(map)
}

/// Папка вывода либо новая, либо прошлый вывод `art` (там лежит `manifest.json`).
/// Прошлый вывод очищается, чтобы не копились файлы со старыми хешами.
fn prepare_out(out: &Path) -> Result<(), String> {
    if !out.exists() {
        return std::fs::create_dir_all(out).map_err(|err| format!("{}: {err}", out.display()));
    }
    let manifest = out.join("manifest.json");
    let empty = std::fs::read_dir(out)
        .map_err(|err| err.to_string())?
        .next()
        .is_none();
    if empty {
        return Ok(());
    }
    if !manifest.exists() {
        return Err(format!(
            "{} is not empty and is not an art output (no manifest.json)",
            out.display()
        ));
    }
    for entry in std::fs::read_dir(out)
        .map_err(|err| err.to_string())?
        .flatten()
    {
        let path = entry.path();
        let is_size_dir = path.is_dir()
            && path
                .file_name()
                .and_then(|n| n.to_str())
                .is_some_and(|n| n.parse::<u32>().is_ok());
        if is_size_dir {
            std::fs::remove_dir_all(&path).map_err(|err| format!("{}: {err}", path.display()))?;
        }
    }
    std::fs::remove_file(&manifest).map_err(|err| err.to_string())
}

fn usage() -> String {
    "usage: art <check|build> --kit <ContentKit dir> --export <items json> [--out <dir>] [--rules <rules.toml>]".to_owned()
}

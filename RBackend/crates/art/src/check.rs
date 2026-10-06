//! `art check`: резолв без кодирования — быстрый ответ, готов ли новый архив.
//!
//! Печатает, сколько предметов нашлось, каких нет (им нужны правила),
//! какие `id` дают одинаковый slug и какие картинки архива не нужны ни одному предмету.

use crate::kit::KitIndex;
use crate::resolve::{Resolved, Resolver};
use crate::rules::Rules;
use rbackend_core::{CatalogExport, SlugService};
use std::collections::{BTreeMap, BTreeSet};
use std::fmt;
use std::path::{Path, PathBuf};

/// Итог проверки.
#[derive(Debug, Default)]
pub struct CheckReport {
    /// Версия игры из экспорта.
    pub game_version: String,
    /// Предметов с картинкой.
    pub resolved: usize,
    /// Предметов без картинки по правилам.
    pub missing_by_rule: usize,
    /// Ошибки резолва: предмету нужна строка в правилах.
    pub unresolved: Vec<String>,
    /// Разные `id` с одинаковым slug.
    pub slug_clashes: Vec<String>,
    /// Картинки архива, не нужные ни одному предмету (относительно корня архива).
    pub unused: Vec<String>,
}

/// Проверяет архив и экспорт по правилам.
///
/// # Errors
/// Экспорт или архив не читаются. Непокрытые предметы — не ошибка, а часть отчёта.
pub fn check(kit: &Path, export: &Path, rules: &Rules) -> Result<CheckReport, String> {
    let bytes = std::fs::read(export).map_err(|err| format!("{}: {err}", export.display()))?;
    let export = CatalogExport::parse(&bytes).map_err(|err| err.to_string())?;
    let index = KitIndex::scan(kit, &rules.sources.roots)?;
    let resolver = Resolver::new(&index, rules);
    let mut report = CheckReport {
        game_version: export.app_version.clone(),
        ..CheckReport::default()
    };
    let mut used: BTreeSet<PathBuf> = BTreeSet::new();
    let mut slugs: BTreeMap<String, String> = BTreeMap::new();
    for item in &export.items {
        let slug = SlugService::to_slug(item.id.as_str()).to_string();
        if let Some(other) = slugs.insert(slug.clone(), item.id.clone()) {
            report
                .slug_clashes
                .push(format!("{other} / {} -> {slug}", item.id));
        }
        match resolver.resolve(&item.id, &item.name) {
            Ok(Resolved::Art(source)) => {
                report.resolved += 1;
                used.extend(source.layers);
                used.extend(source.states.into_values());
            }
            Ok(Resolved::Missing(_)) => report.missing_by_rule += 1,
            Err(err) => report.unresolved.push(err),
        }
    }
    report.unused = index
        .paths()
        .filter(|path| !used.contains(*path))
        .map(|path| {
            path.strip_prefix(kit)
                .unwrap_or(path)
                .to_string_lossy()
                .replace('\\', "/")
        })
        .collect();
    report.unused.sort();
    Ok(report)
}

impl fmt::Display for CheckReport {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        writeln!(f, "game {}: resolved={} missing_by_rule={} unresolved={} slug_clashes={} unused_images={}",
            self.game_version, self.resolved, self.missing_by_rule, self.unresolved.len(), self.slug_clashes.len(), self.unused.len())?;
        for (title, list) in [
            ("unresolved", &self.unresolved),
            ("slug clashes", &self.slug_clashes),
            ("unused images", &self.unused),
        ] {
            if !list.is_empty() {
                writeln!(f, "\n{title}:")?;
                for line in list {
                    writeln!(f, "- {line}")?;
                }
            }
        }
        Ok(())
    }
}

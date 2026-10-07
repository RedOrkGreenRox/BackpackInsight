//! `Gen` — реестр веток и выбор ветки по пути (Rust-версия `ground/roots/Gen.ts`).

use super::{BranchEntry, Params};
use crate::branches::{
    editor::EditorBranch, items::ItemsBranch, main::MainBranch, not_found::NotFoundBranch,
};

/// Все ветки сайта в порядке проверки. `NotFoundBranch` — запасная.
const REGISTRY: &[BranchEntry] = &[
    BranchEntry::of::<MainBranch>(),
    BranchEntry::of::<ItemsBranch>(),
    BranchEntry::of::<EditorBranch>(),
    BranchEntry::of::<NotFoundBranch>(),
];

/// Реестр веток.
pub struct Gen;

impl Gen {
    /// Все зарегистрированные ветки.
    #[must_use]
    pub fn branches() -> &'static [BranchEntry] {
        REGISTRY
    }

    /// Ветка для пути и её параметры; неизвестный путь ведёт в `NotFoundBranch`.
    #[must_use]
    pub fn resolve(path: &str) -> (BranchEntry, Params) {
        REGISTRY
            .iter()
            .find_map(|entry| entry.spec.matches(path).map(|params| (*entry, params)))
            .unwrap_or((BranchEntry::of::<NotFoundBranch>(), Params::new()))
    }
}

#[cfg(test)]
mod tests {
    use super::Gen;

    #[test]
    fn resolves_known_and_unknown_paths() {
        assert_eq!(Gen::resolve("/").0.spec.name, "MainBranch");
        assert_eq!(Gen::resolve("/items").0.spec.name, "ItemsBranch");
        assert_eq!(Gen::resolve("/editor").0.spec.name, "EditorBranch");
        assert_eq!(Gen::resolve("/nope/at/all").0.spec.name, "NotFoundBranch");
    }
}

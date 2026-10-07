//! Поиск корня репозитория: первый каталог вверх от старта, где лежит `Backend/Cargo.toml`.

use std::{
    env,
    path::{Path, PathBuf},
};

/// Файл-признак корня проекта, относительно корня.
pub const PROJECT_ROOT_MARKER: &str = "Backend/Cargo.toml";

/// Корень проекта, найденный вверх от текущего каталога процесса.
pub fn find_project_root() -> Result<PathBuf, String> {
    let current = env::current_dir().map_err(|err| err.to_string())?;
    find_project_root_from(&current)
}

/// Корень проекта, найденный вверх от `start` (включая сам `start`).
pub fn find_project_root_from(start: &Path) -> Result<PathBuf, String> {
    start
        .ancestors()
        .find(|dir| dir.join(PROJECT_ROOT_MARKER).is_file())
        .map(Path::to_path_buf)
        .ok_or_else(|| {
            format!(
                "could not find project root with {PROJECT_ROOT_MARKER} above {}",
                start.display()
            )
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_repo_root_from_crate_dir() {
        let crate_dir = Path::new(env!("CARGO_MANIFEST_DIR"));
        let root = find_project_root_from(crate_dir).expect("root above crate dir");
        assert!(root.join(PROJECT_ROOT_MARKER).is_file());
    }

    #[test]
    fn fails_without_marker() {
        assert!(find_project_root_from(Path::new("/")).is_err());
    }
}

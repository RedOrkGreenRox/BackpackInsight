//! Временный ContentKit для тестов: крошечные PNG в нужных папках.

use image::{Rgba, RgbaImage};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};

static NEXT: AtomicUsize = AtomicUsize::new(0);

/// Папка во временном каталоге, удаляется при `Drop`.
pub struct TestKit {
    /// Корень архива.
    pub root: PathBuf,
}

impl TestKit {
    /// Пустой архив с уникальным именем.
    pub fn new() -> Self {
        let n = NEXT.fetch_add(1, Ordering::Relaxed);
        let root = std::env::temp_dir().join(format!("art-test-{}-{n}", std::process::id()));
        let _ = std::fs::remove_dir_all(&root);
        Self { root }
    }

    /// Кладёт PNG `w×h` одного цвета по пути `rel` внутри архива.
    pub fn png(&self, rel: &str, w: u32, h: u32, color: [u8; 4]) -> PathBuf {
        let path = self.root.join(rel);
        if let Some(dir) = path.parent() {
            std::fs::create_dir_all(dir).unwrap_or_else(|err| panic!("{err}"));
        }
        RgbaImage::from_pixel(w, h, Rgba(color))
            .save(&path)
            .unwrap_or_else(|err| panic!("{err}"));
        path
    }

    /// Корень как `&Path`.
    pub fn path(&self) -> &Path {
        &self.root
    }
}

impl Drop for TestKit {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.root);
    }
}

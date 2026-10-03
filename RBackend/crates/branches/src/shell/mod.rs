//! Острова каркаса сайта: боковая панель с меню и параллакс фона, а в браузере ещё
//! докачка WASM ленивых островов.
//!
//! Компилируются и для сервера, и для WASM. Остальной каркас (документ, фон,
//! выбор ветки) рисует сервер в [`crate::roots`].

mod parallax;
#[cfg(feature = "hydrate")]
mod prefetch;
mod sidebar;

pub use parallax::ParallaxManager;
#[cfg(feature = "hydrate")]
pub use prefetch::prefetch_lazy_islands;
pub use sidebar::{NavTab, SidebarLabels, SidebarManager};

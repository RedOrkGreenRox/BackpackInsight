//! Острова каркаса сайта: боковая панель с меню и параллакс фона.
//!
//! Компилируются и для сервера, и для WASM. Остальной каркас (документ, фон,
//! выбор ветки) рисует сервер в [`crate::roots`].

mod parallax;
mod sidebar;

pub use parallax::ParallaxManager;
pub use sidebar::{NavTab, SidebarLabels, SidebarManager};

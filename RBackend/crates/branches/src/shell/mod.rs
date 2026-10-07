//! Острова каркаса сайта: меню и параллакс фона, а в браузере ещё плавный уход
//! со страницы и докачка WASM ленивых островов.
//!
//! Компилируются и для сервера, и для WASM. Остальной каркас (документ, фон,
//! разметка меню, выбор ветки) рисует сервер в [`crate::roots`].

#[cfg(feature = "hydrate")]
mod drop_wave;
#[cfg(feature = "hydrate")]
mod fade;
#[cfg(feature = "hydrate")]
mod lang_stay;
mod parallax;
#[cfg(feature = "hydrate")]
mod prefetch;
mod sidebar;

#[cfg(feature = "hydrate")]
pub use fade::fade_on_leave;
pub use parallax::ParallaxManager;
#[cfg(feature = "hydrate")]
pub use prefetch::prefetch_lazy_islands;
pub use sidebar::SidebarManager;

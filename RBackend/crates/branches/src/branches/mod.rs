//! Ветки-страницы сайта. Каждая ветка реализует [`crate::roots::Branch`] и
//! регистрируется в [`crate::roots::Gen`].
//!
//! Модуль `items` компилируется и для сервера, и для WASM: в нём живёт остров
//! `ItemsManager`. Остальные ветки чисто серверные.

#[cfg(feature = "ssr")]
pub mod editor;
pub mod items;
#[cfg(feature = "ssr")]
pub mod main;
#[cfg(feature = "ssr")]
pub mod not_found;

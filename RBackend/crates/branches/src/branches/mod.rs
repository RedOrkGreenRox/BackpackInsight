//! Ветки-страницы сайта. Каждая ветка реализует [`crate::roots::Branch`] и
//! регистрируется в [`crate::roots::Gen`].
//!
//! Модули `items` и `editor` компилируются и для сервера, и для WASM: в них живут
//! острова `ItemsManager` и `EditorManager`. Остальные ветки чисто серверные.

pub mod editor;
pub mod items;
#[cfg(feature = "ssr")]
pub mod main;
#[cfg(feature = "ssr")]
pub mod not_found;

//! Ветка «Редактор»: поле рюкзака как в игре, только без магазина.
//!
//! - [`EditorBranch`] (только сервер) — страница `/editor`;
//! - [`ui::manager::EditorManager`] — остров: каталог, поле, склад, перетаскивание;
//! - [`kit_fn::editor_kit`] — серверная функция набора предметов;
//! - [`model`] — правила поля, файл билда и запись в адресе, без браузера.

pub mod kit_fn;
pub mod model;
pub mod ui;

#[cfg(feature = "ssr")]
mod branch;
#[cfg(feature = "ssr")]
pub use branch::EditorBranch;

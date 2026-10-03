//! Корни дендритной системы: каркас, через который растут все ветки-страницы.
//!
//! Имена повторяют фронтенд `Frontend/Web/ground/roots`:
//! [`Gen`] — реестр веток и выбор по пути, [`Shell`](shell) — HTML-каркас,
//! [`Branch`]/[`BranchSpec`] — контракт страницы, [`BranchRunner`] — сборка
//! маршрутов Axum и запуск ветки, [`BranchCtx`] — всё, что ветке нужно о запросе.

mod backdrop;
mod branch;
mod chrome;
mod ctx;
mod gen;
mod head;
mod i18n;
mod lazy;
mod per_lang;
mod request;
mod runner;
mod shell;
mod spec;
mod split_files;

pub use backdrop::Backdrop;
pub use branch::{Branch, BranchEntry};
pub use ctx::BranchCtx;
pub use gen::Gen;
pub use head::PageHead;
pub use i18n::Dict;
pub use lazy::LazyIslands;
pub use per_lang::per_lang;
pub use runner::BranchRunner;
pub use shell::{shell, App};
pub use spec::{BranchSpec, Params};

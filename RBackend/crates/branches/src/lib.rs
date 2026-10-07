//! branches — Leptos SSR + Islands фронтенд `BackpackInsight`.
//!
//! Дендритная схема повторяет фронтенд `Frontend/Web/ground`:
//! - [`roots`] — корни: `Gen` выбирает ветку по пути, `Shell` рисует каркас
//!   документа, `Branch`/`BranchSpec` описывают страницу, `BranchRunner`
//!   превращает спецификации в маршруты Axum и рендерит ветку;
//! - [`branches`] — ветки-страницы (`MainBranch`, `ItemsBranch`, `EditorBranch`,
//!   `NotFoundBranch`);
//! - [`shell`] — острова общего каркаса: меню и параллакс фона;
//! - [`catalog`] — каталог предметов из FlatBuffers-паков, живёт только на сервере.
//!
//! В браузер уходит готовый HTML. WASM содержит только острова
//! (интерактивные менеджеры вроде `ItemsManager`).

// Типы представлений Leptos глубоко вложены; стандартного лимита 128 не хватает.
#![recursion_limit = "256"]

pub mod branches;
pub mod model;
pub mod shell;

#[cfg(feature = "ssr")]
pub mod catalog;
#[cfg(feature = "ssr")]
pub mod roots;

/// Точка входа WASM: оживляет острова, отрендеренные сервером.
#[cfg(feature = "hydrate")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn hydrate() {
    console_error_panic_hook::set_once();
    leptos::mount::hydrate_islands();
    shell::fade_on_leave();
    shell::prefetch_lazy_islands();
}

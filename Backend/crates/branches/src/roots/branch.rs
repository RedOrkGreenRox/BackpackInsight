//! `Branch` — типизированная единица страницы и запись реестра [`BranchEntry`].

use super::{BranchCtx, BranchSpec, PageHead};
use leptos::prelude::AnyView;

/// Ветка-страница: контракт и функция рендера.
///
/// Рендер синхронный: данные ветки (каталог, словарь) уже в памяти сервера,
/// поэтому HTML готов целиком в первом же ответе, без `Suspense`.
pub trait Branch {
    /// Контракт ветки.
    const SPEC: BranchSpec;

    /// Заголовок и описание страницы; теги `<head>` из них рисует каркас.
    fn head(ctx: &BranchCtx) -> PageHead;

    /// Рисует страницу для конкретного запроса.
    fn render(ctx: BranchCtx) -> AnyView;
}

/// Запись реестра `Gen`: контракт и указатель на рендер.
#[derive(Clone, Copy, Debug)]
pub struct BranchEntry {
    /// Контракт ветки.
    pub spec: BranchSpec,
    /// Заголовок и описание ветки.
    pub head: fn(&BranchCtx) -> PageHead,
    /// Рендер ветки.
    pub render: fn(BranchCtx) -> AnyView,
}

impl BranchEntry {
    /// Запись для ветки `B`.
    #[must_use]
    pub const fn of<B: Branch>() -> Self {
        Self {
            spec: B::SPEC,
            head: B::head,
            render: B::render,
        }
    }
}

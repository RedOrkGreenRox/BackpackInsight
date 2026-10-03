//! `EditorBranch` — страница «Редактор». Пока заготовка: заголовок без содержимого.

use crate::roots::{Branch, BranchCtx, BranchSpec, PageHead};
use leptos::prelude::*;

/// Страница редактора.
pub struct EditorBranch;

impl Branch for EditorBranch {
    const SPEC: BranchSpec = BranchSpec {
        name: "EditorBranch",
        path: "/editor",
        islands: &[],
        sitemap: false,
    };

    fn head(ctx: &BranchCtx) -> PageHead {
        PageHead::section(&ctx.t("editor_title"), ctx.t("editor_meta_description"))
    }

    fn render(ctx: BranchCtx) -> AnyView {
        let title = ctx.t("editor_title");
        view! {
            <section class="wiki-section">
                <div class="container">
                    <div class="wiki-header">
                        <h1 class="main-title" data-aos="fade-down">{title}</h1>
                    </div>
                </div>
            </section>
        }
        .into_any()
    }
}

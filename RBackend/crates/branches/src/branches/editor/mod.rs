//! `EditorBranch` — страница «Редактор». Пока заготовка: заголовок без содержимого.

use crate::roots::{Branch, BranchCtx, BranchSpec};
use leptos::prelude::*;
use leptos_meta::{Meta, Title};

/// Страница редактора.
pub struct EditorBranch;

impl Branch for EditorBranch {
    const SPEC: BranchSpec = BranchSpec {
        name: "EditorBranch",
        path: "/editor",
        islands: &[],
        sitemap: false,
    };

    fn render(ctx: BranchCtx) -> AnyView {
        let title = ctx.t("editor_title");
        view! {
            <Title text=format!("{title} | Backpack Insight")/>
            <Meta name="description" content=ctx.t("editor_meta_description")/>
            <Meta name="robots" content="noindex"/>
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

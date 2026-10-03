//! `NotFoundBranch` — страница 404 для неизвестных путей (и явного `/404`).

use crate::roots::{Branch, BranchCtx, BranchSpec, PageHead};
use axum::http::StatusCode;
use leptos::prelude::*;

/// Ветка 404: отдаёт статус 404 и предлагает вернуться на главную.
pub struct NotFoundBranch;

impl Branch for NotFoundBranch {
    const SPEC: BranchSpec = BranchSpec {
        name: "NotFoundBranch",
        path: "/404",
        islands: &[],
        sitemap: false,
    };

    fn head(ctx: &BranchCtx) -> PageHead {
        PageHead {
            title: ctx.t("not_found_meta_title"),
            description: ctx.t("not_found_meta_description"),
        }
    }

    fn render(ctx: BranchCtx) -> AnyView {
        ctx.set_status(StatusCode::NOT_FOUND);
        view! {
            <div class="not-found-page">
                <div class="container-404">
                    <h1 class="title-404">{ctx.t("not_found_title")}</h1>
                    <p class="text-404">{ctx.t("not_found_text")}</p>
                    <a href="/" id="homeBtn" class="btn-404">{ctx.t("not_found_button")}</a>
                </div>
            </div>
        }
        .into_any()
    }
}

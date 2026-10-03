//! `MainBranch` — главная: витрина профиля с зоной загрузки экспорта.
//!
//! Разметка — как у TS-версии (`ground/branches/main`). Загрузка профиля
//! (остров `MainManager`) переносится вместе со страницей профиля; пока форма
//! только показывается.

use crate::roots::{Branch, BranchCtx, BranchSpec, PageHead};
use leptos::prelude::*;

/// Главная страница.
pub struct MainBranch;

impl Branch for MainBranch {
    const SPEC: BranchSpec = BranchSpec {
        name: "MainBranch",
        path: "/",
        islands: &[],
        sitemap: true,
    };

    fn head(ctx: &BranchCtx) -> PageHead {
        PageHead::site(ctx.t("main_meta_description"))
    }

    fn render(ctx: BranchCtx) -> AnyView {
        view! {
            <div class="container">
                <div id="errorContainer" class="error" hidden role="alert" aria-live="polite"></div>
                <h1 class="main-title" data-aos="fade-down">{ctx.t("profile_title")}</h1>
                <form class="upload-zone" id="uploadForm">
                    <div class="upload-area" id="uploadArea">
                        <input type="file" id="fileInput" accept=".json" hidden/>
                        <textarea
                            name="json_text"
                            id="jsonInput"
                            placeholder=""
                            aria-label=ctx.t("profile_upload_textarea_label")
                        ></textarea>
                        <div class="upload-hint" id="uploadHint">
                            <span>{ctx.t("profile_upload_hint_1")}</span>
                            <span class="pc-only">{ctx.t("profile_upload_hint_2")}</span>
                            <span>{ctx.t("profile_upload_hint_3")}</span>
                        </div>
                    </div>
                    <button class="button-view-profile" type="submit" id="submitBtn">
                        {ctx.t("profile_view_button")}
                    </button>
                </form>
            </div>
        }
        .into_any()
    }
}

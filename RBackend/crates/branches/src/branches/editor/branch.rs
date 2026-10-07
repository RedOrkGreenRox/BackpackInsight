//! `EditorBranch` — страница «Редактор» `/editor` (только сервер).

use super::{
    model::{url::UrlCode, EditorLabels},
    ui::manager::EditorManager,
};
use crate::roots::{per_lang, Branch, BranchCtx, BranchSpec, PageHead};
use leptos::prelude::*;

/// Самая длинная запись билда в адресе, которую сервер передаёт острову, символов.
const MAX_CODE: usize = 4000;

/// Страница редактора: заголовок и остров с билдом из адреса.
pub struct EditorBranch;

impl Branch for EditorBranch {
    const SPEC: BranchSpec = BranchSpec {
        name: "EditorBranch",
        path: "/editor",
        islands: &["EditorManager"],
        sitemap: false,
    };

    fn head(ctx: &BranchCtx) -> PageHead {
        PageHead::section(&ctx.t("editor_title"), ctx.t("editor_meta_description"))
    }

    fn render(ctx: BranchCtx) -> AnyView {
        let title = ctx.t("editor_title");
        let param = |name: &str| -> String {
            ctx.query(name)
                .unwrap_or_default()
                .chars()
                .take(MAX_CODE)
                .collect()
        };
        let code = UrlCode {
            hero: param("h"),
            field: param("b"),
            storage: param("s"),
        };
        let labels = labels(&ctx);
        let manager = view! { <EditorManager lang=ctx.lang labels code/> };
        view! {
            <section class="wiki-section">
                <div class="container">
                    <div class="wiki-header">
                        <h1 class="main-title" data-aos="fade-down">{title}</h1>
                    </div>
                    {per_lang(ctx.lang, manager)}
                </div>
            </section>
        }
        .into_any()
    }
}

/// Подписи острова из словаря (`editor_<поле>`).
fn labels(ctx: &BranchCtx) -> EditorLabels {
    let t = |key: &str| ctx.t(&format!("editor_{key}"));
    EditorLabels {
        catalog: t("catalog"),
        search: t("search"),
        hero: t("hero"),
        hero_all: t("hero_all"),
        kind: t("kind"),
        kind_all: t("kind_all"),
        kind_bags: t("kind_bags"),
        kind_items: t("kind_items"),
        rarity: t("rarity"),
        rarity_all: t("rarity_all"),
        sort: t("sort"),
        sort_rarity: t("sort_rarity"),
        sort_name: t("sort_name"),
        sort_price: t("sort_price"),
        more: t("more"),
        inventory: t("inventory"),
        storage: t("storage"),
        storage_empty: t("storage_empty"),
        bag_mode: t("bag_mode"),
        reset: t("reset"),
        import: t("import"),
        export: t("export"),
        apply: t("apply"),
        close: t("close"),
        download: t("download"),
        import_hint: t("import_hint"),
        import_error: t("import_error"),
        unknown: t("unknown"),
        loading: t("loading"),
        hint: t("hint"),
    }
}

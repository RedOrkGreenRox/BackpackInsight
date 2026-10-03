//! `ItemsBranch` — страница каталога `/items` (только сервер).

use super::{manager::ItemsManager, search_fn::MAX_QUERY};
use crate::{
    catalog::search_upto,
    model::ItemsLabels,
    roots::{per_lang, Branch, BranchCtx, BranchSpec},
};
use leptos::prelude::*;
use leptos_meta::{Meta, Title};

/// Каталог: остров с заголовком, поиском и первой порцией карточек, уже отрендеренной на сервере.
pub struct ItemsBranch;

impl Branch for ItemsBranch {
    const SPEC: BranchSpec = BranchSpec {
        name: "ItemsBranch",
        path: "/items",
        islands: &["ItemsManager"],
        sitemap: true,
    };

    fn render(ctx: BranchCtx) -> AnyView {
        let query: String = ctx
            .query("q")
            .unwrap_or_default()
            .chars()
            .take(MAX_QUERY)
            .collect();
        let page = ctx
            .query("page")
            .and_then(|page| page.parse().ok())
            .unwrap_or(0);
        let initial = search_upto(ctx.catalog(), &query, page);
        let labels = ItemsLabels {
            title: ctx.t("items_title"),
            subtitle: ctx.t("items_subtitle"),
            placeholder: ctx.t("items_search_placeholder"),
            empty: ctx.t("items_empty"),
            found: ctx.t("items_found"),
        };
        let manager = view! { <ItemsManager lang=ctx.lang query initial labels/> };
        view! {
            <Title text=format!("{} | Backpack Insight", ctx.t("items_title"))/>
            <Meta name="description" content=ctx.t("items_subtitle")/>
            <section class="wiki-section">
                <div class="container">{per_lang(ctx.lang, manager)}</div>
            </section>
        }
        .into_any()
    }
}

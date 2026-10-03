//! Обвязка страницы вокруг ветки: боковая панель с навигацией.
//!
//! Сервер переводит подписи и передаёт их острову [`SidebarManager`].

use super::{per_lang, BranchCtx};
use crate::shell::{NavTab, SidebarLabels, SidebarManager};
use leptos::prelude::*;

/// Вкладки навигации: адрес, иконка внутри `/images` и ключ перевода.
const NAV: &[(&str, &str, &str)] = &[
    ("/", "templates/main", "sidebar_main"),
    ("/items", "templates/recipes", "sidebar_items"),
    ("/editor", "fonticon/typebag", "sidebar_editor"),
];

/// Боковая панель на языке страницы. При смене языка остров заменяется целиком.
pub fn sidebar(ctx: &BranchCtx) -> impl IntoView {
    let target = ctx.lang.other();
    let labels = SidebarLabels {
        menu: ctx.t("sidebar_menu"),
        home: ctx.t("sidebar_main"),
        switch_lang: ctx.tf(
            "lang_switch_button",
            &[("lang", &target.code().to_uppercase())],
        ),
    };
    let tabs = NAV
        .iter()
        .map(|(href, icon, key)| NavTab {
            href: (*href).to_string(),
            icon: (*icon).to_string(),
            label: ctx.t(key),
        })
        .collect::<Vec<_>>();
    per_lang(ctx.lang, view! { <SidebarManager target labels tabs/> })
}

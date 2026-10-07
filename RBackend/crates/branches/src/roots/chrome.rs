//! Обвязка страницы вокруг ветки: кнопка меню, боковая панель и затемнение.
//!
//! Разметку рисует сервер на языке страницы, а не остров. Поэтому при каждом
//! переходе islands router обновляет её вместе со страницей: подсвечивается вкладка
//! открытой страницы, подписи меняются при смене языка, а панель закрывается.
//! Оживляет разметку ленивый остров [`SidebarManager`](crate::shell::SidebarManager).

use super::BranchCtx;
use leptos::prelude::*;

/// Вкладки навигации: адрес, иконка внутри `/images` и ключ перевода.
const NAV: &[(&str, &str, &str)] = &[
    ("/", "templates/main", "sidebar_main"),
    ("/items", "templates/recipes", "sidebar_items"),
    ("/editor", "fonticon/typebag", "sidebar_editor"),
];

/// Кнопка меню, панель и затемнение на языке страницы.
pub fn sidebar(ctx: &BranchCtx) -> impl IntoView {
    let target = ctx.lang.other();
    let switch_lang = ctx.tf(
        "lang_switch_button",
        &[("lang", &target.code().to_uppercase())],
    );
    let home = ctx.t("sidebar_main");
    let nav_label = home.clone();
    let tabs = NAV
        .iter()
        .map(|(href, icon, key)| nav_tab(href, icon, ctx.t(key), is_current(&ctx.path, href)))
        .collect_view();
    view! {
        <div class="controls-wrapper">
            <button class="menu-toggle" id="menuToggle" r#type="button" aria-label=ctx.t("sidebar_menu") aria-controls="sidebar" aria-expanded="false">
                <picture>
                    <source srcset="/images/const/avif/menu.avif" r#type="image/avif"/>
                    <img src="/images/const/webp/menu.webp" alt="" class="toggle-icon"/>
                </picture>
            </button>
        </div>
        <nav class="sidebar" id="sidebar" aria-label=nav_label>
            <div class="sidebar-header">
                <a class="button-logo" href="/" aria-label=home>
                    <picture>
                        <source srcset="/images/const/avif/logo.avif" r#type="image/avif"/>
                        <img src="/images/const/webp/logo.webp" alt="" class="logo-icon"/>
                    </picture>
                </a>
            </div>
            <div class="nav-tabs">{tabs}</div>
            <a class="nav-tab" id="lang-switcher" href=format!("?lang={}", target.code()) hreflang=target.code()>
                <span class="page-title">{switch_lang}</span>
            </a>
        </nav>
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
    }
}

/// Одна вкладка. `aria-current` есть всегда (`page` или `false`): router при
/// переходе только переписывает атрибуты и не удалял бы устаревший.
fn nav_tab(href: &str, icon: &str, label: String, current: bool) -> impl IntoView {
    let (avif, webp) = icon_paths(icon);
    let class = if current { "nav-tab active" } else { "nav-tab" };
    let aria_current = if current { "page" } else { "false" };
    view! {
        <a class=class href=href.to_owned() aria-current=aria_current>
            <picture>
                <source srcset=avif r#type="image/avif"/>
                <img src=webp alt="" loading="lazy"/>
            </picture>
            <span class="page-title">{label}</span>
        </a>
    }
}

/// Вкладка ведёт на открытую страницу или на её раздел (`/items` для `/items/...`).
fn is_current(path: &str, href: &str) -> bool {
    if href == "/" {
        return path == "/";
    }
    path.strip_prefix(href)
        .is_some_and(|rest| rest.is_empty() || rest.starts_with('/'))
}

/// Пути иконки в двух форматах (`templates/main` → `/images/templates/{avif,webp}/main.*`).
fn icon_paths(icon: &str) -> (String, String) {
    let (dir, name) = icon.rsplit_once('/').unwrap_or(("const", icon));
    (
        format!("/images/{dir}/avif/{name}.avif"),
        format!("/images/{dir}/webp/{name}.webp"),
    )
}

#[cfg(test)]
mod tests {
    use super::{icon_paths, is_current};

    #[test]
    fn current_tab_matches_page_and_its_section() {
        assert!(is_current("/", "/"));
        assert!(!is_current("/items", "/"));
        assert!(is_current("/items", "/items"));
        assert!(is_current("/items/sword", "/items"));
        assert!(!is_current("/itemsx", "/items"));
    }

    #[test]
    fn icon_paths_keep_folder() {
        let (avif, webp) = icon_paths("templates/main");
        assert_eq!(avif, "/images/templates/avif/main.avif");
        assert_eq!(webp, "/images/templates/webp/main.webp");
    }
}

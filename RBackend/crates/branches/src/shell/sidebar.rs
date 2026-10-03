//! `SidebarManager` — кнопка меню, выезжающая боковая панель и переключатель языка.
//!
//! Разметка и классы те же, что в TS-версии (`ground/roots/Shell.ts`), поэтому
//! работают перенесённые стили `style/roots/_roots/shell`. Переходы по ссылкам
//! перехватывает islands router Leptos: страница не перезагружается.

use crate::model::Lang;
use leptos::prelude::*;
use serde::{Deserialize, Serialize};

/// Вкладка навигации: адрес, иконка (`templates/main` → `/images/templates/{avif,webp}/main.*`) и подпись.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct NavTab {
    /// Адрес страницы.
    pub href: String,
    /// Папка и имя иконки внутри `/images`, без формата и расширения.
    pub icon: String,
    /// Подпись на языке страницы.
    pub label: String,
}

/// Подписи панели на языке страницы.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct SidebarLabels {
    /// Подпись кнопки меню.
    pub menu: String,
    /// Подпись логотипа (ссылка на главную).
    pub home: String,
    /// Текст кнопки смены языка («Switch to RU»).
    pub switch_lang: String,
}

/// Остров боковой панели. `target` — язык, на который переключает кнопка.
#[island]
#[allow(clippy::must_use_candidate)]
pub fn SidebarManager(target: Lang, labels: SidebarLabels, tabs: Vec<NavTab>) -> impl IntoView {
    let open = RwSignal::new(false);
    Effect::new(move |_| set_body_open(open.get()));
    let escape = window_event_listener(leptos::ev::keydown, move |ev| {
        if ev.key() == "Escape" {
            open.set(false);
        }
    });
    on_cleanup(move || escape.remove());
    let close = move |_| open.set(false);
    let nav_label = labels.home.clone();
    let home = labels.home;
    let tabs = tabs
        .into_iter()
        .map(|tab| {
            let (avif, webp) = icon_paths(&tab.icon);
            view! {
                <a class="nav-tab" href=tab.href on:click=close>
                    <picture>
                        <source srcset=avif r#type="image/avif"/>
                        <img src=webp alt="" loading="lazy"/>
                    </picture>
                    <span class="page-title">{tab.label}</span>
                </a>
            }
        })
        .collect_view();

    view! {
        <div class="controls-wrapper">
            <button
                class="menu-toggle"
                id="menuToggle"
                aria-label=labels.menu
                aria-controls="sidebar"
                aria-expanded=move || open.get().to_string()
                on:click=move |_| open.update(|value| *value = !*value)
            >
                <picture>
                    <source srcset="/images/const/avif/menu.avif" r#type="image/avif"/>
                    <img src="/images/const/webp/menu.webp" alt="" class="toggle-icon"/>
                </picture>
            </button>
        </div>
        <nav class="sidebar" class:open=move || open.get() id="sidebar" aria-label=nav_label>
            <div class="sidebar-header">
                <a class="button-logo" href="/" aria-label=home on:click=close>
                    <picture>
                        <source srcset="/images/const/avif/logo.avif" r#type="image/avif"/>
                        <img src="/images/const/webp/logo.webp" alt="" class="logo-icon"/>
                    </picture>
                </a>
            </div>
            <div class="nav-tabs">{tabs}</div>
            <a
                id="lang-switcher"
                href=format!("?lang={}", target.code())
                hreflang=target.code()
                on:click=move |ev| retarget_to_current_page(&ev, target)
            >
                {labels.switch_lang}
            </a>
        </nav>
        <div class="sidebar-overlay" id="sidebarOverlay" on:click=close></div>
    }
}

/// Пути иконки в двух форматах.
fn icon_paths(icon: &str) -> (String, String) {
    let (dir, name) = icon.rsplit_once('/').unwrap_or(("const", icon));
    (
        format!("/images/{dir}/avif/{name}.avif"),
        format!("/images/{dir}/webp/{name}.webp"),
    )
}

/// Класс `sidebar-open` на `<body>` прячет кнопку меню и показывает затемнение.
fn set_body_open(open: bool) {
    #[cfg(feature = "hydrate")]
    if let Some(body) = document().body() {
        let _ = body.class_list().toggle_with_force("sidebar-open", open);
    }
    #[cfg(not(feature = "hydrate"))]
    let _ = open;
}

/// Перед переходом ставит в ссылку текущий адрес с новым `lang`: остров не
/// перерисовывается при навигации, а язык надо сменить именно на открытой странице.
fn retarget_to_current_page(ev: &leptos::ev::MouseEvent, target: Lang) {
    #[cfg(feature = "hydrate")]
    {
        use wasm_bindgen::JsCast;
        let anchor = ev
            .current_target()
            .and_then(|node| node.dyn_into::<web_sys::HtmlAnchorElement>().ok());
        let url = window()
            .location()
            .href()
            .ok()
            .and_then(|href| web_sys::Url::new(&href).ok());
        if let (Some(anchor), Some(url)) = (anchor, url) {
            url.search_params().set("lang", target.code());
            anchor.set_href(&url.href());
        }
    }
    #[cfg(not(feature = "hydrate"))]
    let _ = (ev, target);
}

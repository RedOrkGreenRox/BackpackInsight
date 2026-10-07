//! `fade_on_leave` — плавный уход со страницы, как в TS-версии (`Gen.ts`, `#app.fade-out`).
//!
//! Islands router начинает менять страницу только когда она пришла с сервера.
//! Чтобы клик отзывался сразу, здесь по клику на ссылку другой страницы `<body>`
//! получает класс `navigating`, и `#app` начинает гаснуть, пока идёт загрузка.
//! Новая страница приходит со своим `class` у `<body>`; router переписывает
//! атрибут, класс исчезает, и `#app` проявляется (стили:
//! `style/roots/_roots/shell/navigation/_page-transitions.scss`).
//!
//! Смена языка ведёт на тот же путь и не гасит страницу: текст только коротко
//! размывается (View Transitions).

use leptos::prelude::{document, set_timeout, window};
use std::{
    sync::atomic::{AtomicU32, Ordering},
    time::Duration,
};
use wasm_bindgen::{closure::Closure, JsCast};
use web_sys::{Element, HtmlAnchorElement, MouseEvent};

/// Класс на `<body>`, пока идёт переход.
const NAVIGATING: &str = "navigating";
/// Если страница так и не пришла, через столько времени содержимое вернётся.
const GIVE_UP: Duration = Duration::from_secs(5);
/// Номер последнего перехода: таймер снимает класс, только если новых не было.
static LAST: AtomicU32 = AtomicU32::new(0);

/// Вешает обработчик кликов на документ (один раз при запуске WASM).
pub fn fade_on_leave() {
    // Документ получает клик раньше окна, где его ловит islands router.
    let click = Closure::<dyn FnMut(MouseEvent)>::new(on_click);
    let _ = document().add_event_listener_with_callback("click", click.as_ref().unchecked_ref());
    click.forget();
}

fn on_click(ev: MouseEvent) {
    let modified = ev.meta_key() || ev.alt_key() || ev.ctrl_key() || ev.shift_key();
    if ev.default_prevented() || ev.button() != 0 || modified {
        return;
    }
    let Some(link) = ev
        .target()
        .and_then(|node| node.dyn_into::<Element>().ok())
        .and_then(|el| el.closest("a[href]").ok().flatten())
        .and_then(|el| el.dyn_into::<HtmlAnchorElement>().ok())
    else {
        return;
    };
    if leads_to_other_page(&link) {
        start();
    }
}

/// Ссылка, которую откроет islands router, и ведёт она не на эту же страницу.
fn leads_to_other_page(link: &HtmlAnchorElement) -> bool {
    let external = link.rel().split_whitespace().any(|rel| rel == "external");
    if !link.target().is_empty() || link.has_attribute("download") || external {
        return false;
    }
    let location = window().location();
    let (Ok(origin), Ok(path)) = (location.origin(), location.pathname()) else {
        return false;
    };
    link.origin() == origin && link.pathname() != path
}

fn start() {
    let Some(body) = document().body() else {
        return;
    };
    let _ = body.class_list().add_1(NAVIGATING);
    let id = LAST.fetch_add(1, Ordering::Relaxed) + 1;
    set_timeout(
        move || {
            if LAST.load(Ordering::Relaxed) == id {
                if let Some(body) = document().body() {
                    let _ = body.class_list().remove_1(NAVIGATING);
                }
            }
        },
        GIVE_UP,
    );
}

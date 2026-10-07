//! `SidebarManager` — ленивый остров, который оживляет меню сайта.
//!
//! Разметку меню рисует сервер ([`crate::roots`], `chrome.rs`), поэтому остров
//! ничего не рисует: он вешает обработчики на документ и переключает классы.
//! Остров ленивый (`#[island(lazy)]`): его код лежит в отдельном WASM-файле и не
//! утяжеляет основной.
//!
//! Состояние «открыто» хранится в самой разметке (класс `open` у `#sidebar`).
//! При переходе islands router переписывает атрибуты серверными, и меню
//! закрывается само, без отдельного кода.

use leptos::prelude::*;

/// Остров меню.
#[island(lazy)]
#[allow(clippy::must_use_candidate)]
pub fn SidebarManager() -> impl IntoView {
    #[cfg(feature = "hydrate")]
    dom::attach();
}

#[cfg(feature = "hydrate")]
mod dom {
    use leptos::prelude::{document, window, window_event_listener};
    use wasm_bindgen::{closure::Closure, JsCast};
    use web_sys::{Element, HtmlElement, MouseEvent};

    const SIDEBAR: &str = "sidebar";
    const TOGGLE: &str = "menuToggle";

    /// Вешает обработчики один раз: острова не пересоздаются при переходах.
    pub fn attach() {
        // На документе, а не на окне: так клик доходит сюда раньше, чем до
        // islands router, и ссылка языка успевает получить новый адрес.
        let click = Closure::<dyn FnMut(MouseEvent)>::new(on_click);
        let _ =
            document().add_event_listener_with_callback("click", click.as_ref().unchecked_ref());
        click.forget();
        // Обработчик живёт, пока открыт сайт; снимать его незачем.
        let _ = window_event_listener(leptos::ev::keydown, |ev| {
            if ev.key() == "Escape" && is_open() {
                set_open(false);
                focus_by_id(TOGGLE);
            }
        });
    }

    fn on_click(ev: MouseEvent) {
        let Some(target) = ev.target().and_then(|node| node.dyn_into::<Element>().ok()) else {
            return;
        };
        let inside = |selector: &str| target.closest(selector).ok().flatten();
        if inside("#menuToggle").is_some() {
            set_open(!is_open());
        } else if inside("#sidebarOverlay").is_some() {
            set_open(false);
        } else if let Some(link) = inside("#lang-switcher") {
            retarget_to_current_page(&link);
        } else if inside("#sidebar a").is_some() {
            set_open(false);
        }
    }

    fn is_open() -> bool {
        document()
            .get_element_by_id(SIDEBAR)
            .is_some_and(|el| el.class_list().contains("open"))
    }

    /// Класс `open` выдвигает панель, `sidebar-open` на `<body>` прячет кнопку
    /// и показывает затемнение. При открытии фокус переходит на первый пункт.
    fn set_open(open: bool) {
        if let Some(sidebar) = document().get_element_by_id(SIDEBAR) {
            let _ = sidebar.class_list().toggle_with_force("open", open);
        }
        if let Some(body) = document().body() {
            let _ = body.class_list().toggle_with_force("sidebar-open", open);
        }
        if let Some(toggle) = document().get_element_by_id(TOGGLE) {
            let _ = toggle.set_attribute("aria-expanded", if open { "true" } else { "false" });
        }
        if open {
            let first = document()
                .query_selector("#sidebar .nav-tab")
                .ok()
                .flatten();
            if let Some(first) = first.and_then(|el| el.dyn_into::<HtmlElement>().ok()) {
                let _ = first.focus();
            }
        }
    }

    fn focus_by_id(id: &str) {
        let element = document().get_element_by_id(id);
        if let Some(element) = element.and_then(|el| el.dyn_into::<HtmlElement>().ok()) {
            let _ = element.focus();
        }
    }

    /// Ставит в ссылку языка текущий адрес с новым `lang`. Сервер знает только
    /// адрес, с которым страница пришла, а поиск в каталоге меняет его на месте.
    fn retarget_to_current_page(link: &Element) {
        let Some(lang) = link.get_attribute("hreflang") else {
            return;
        };
        let url = window()
            .location()
            .href()
            .ok()
            .and_then(|href| web_sys::Url::new(&href).ok());
        if let Some(url) = url {
            url.search_params().set("lang", &lang);
            let _ = link.set_attribute("href", &url.href());
        }
    }
}

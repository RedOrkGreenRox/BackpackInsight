//! Смена языка без закрытия меню и без потери фокуса.
//!
//! Ссылку языка открывает islands router: он загружает ту же страницу на другом
//! языке и переписывает разметку, в том числе меню. Сервер рисует меню
//! закрытым, поэтому без этого модуля меню закрылось бы, а фокус ушёл.
//!
//! Перед переходом [`remember`] запоминает, было ли меню открыто. Когда router
//! поменял у ссылки языка `hreflang` (значит, новая разметка уже на месте),
//! [`restore`] возвращает меню в прежнее состояние и фокус на ссылку языка.
//! Всё это происходит до отрисовки кадра, поэтому меню не мигает.

use leptos::prelude::document;
use std::sync::atomic::{AtomicU8, Ordering};
use wasm_bindgen::{closure::Closure, JsCast};
use web_sys::{HtmlElement, MutationObserver, MutationObserverInit};

/// Ждём ли смены языка: 0 — нет, 1 — меню было закрыто, 2 — открыто.
static PENDING: AtomicU8 = AtomicU8::new(0);
const LANG_SWITCHER: &str = "lang-switcher";

/// Вызывается по клику на ссылку языка.
pub fn remember(was_open: bool) {
    PENDING.store(if was_open { 2 } else { 1 }, Ordering::Relaxed);
}

/// Следит за `hreflang` во всём документе: router может заменить и сам узел.
pub fn watch(set_open: fn(bool, bool)) {
    let callback = Closure::<dyn FnMut()>::new(move || restore(set_open));
    let Ok(observer) = MutationObserver::new(callback.as_ref().unchecked_ref()) else {
        return;
    };
    callback.forget();
    let options = MutationObserverInit::new();
    options.set_subtree(true);
    options.set_attribute_filter(&string_array(&["hreflang"]));
    if let Some(body) = document().body() {
        let _ = observer.observe_with_options(&body, &options);
    }
}

fn restore(set_open: fn(bool, bool)) {
    let was_open = match PENDING.swap(0, Ordering::Relaxed) {
        0 => return,
        state => state == 2,
    };
    set_open(was_open, false);
    let link = document().get_element_by_id(LANG_SWITCHER);
    if let Some(link) = link.and_then(|el| el.dyn_into::<HtmlElement>().ok()) {
        let _ = link.focus();
    }
}

fn string_array(items: &[&str]) -> wasm_bindgen::JsValue {
    let array = items
        .iter()
        .map(|item| wasm_bindgen::JsValue::from_str(item))
        .collect::<web_sys::js_sys::Array>();
    array.into()
}

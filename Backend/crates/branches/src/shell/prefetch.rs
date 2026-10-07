//! `prefetch_lazy_islands` — докачка WASM ленивых островов, которых нет на этой странице.
//!
//! Сервер ставит в `<head>` ссылку на WASM каждого ленивого острова
//! ([`crate::roots::LazyIslands`]). Остров есть на странице → `media="all"`, браузер
//! грузит файл сразу вместе с основным WASM. Острова нет → `media="not all"`, и
//! браузер файл не трогает, чтобы не отнимать канал у самой страницы.
//!
//! Эти файлы докачиваются здесь, когда страница уже загрузилась и браузер простаивает.
//! Ответ попадает в HTTP-кэш, и при переходе (например, Главная → Каталог) загрузчик
//! острова берёт файл из кэша, а не из сети.

use leptos::prelude::{
    document, request_idle_callback_with_handle, set_timeout, window, window_event_listener,
};
use std::time::Duration;
use wasm_bindgen::{closure::Closure, JsCast, JsValue};
use web_sys::{HtmlLinkElement, Response};

/// Ссылки на WASM островов, которых нет на текущей странице.
const SELECTOR: &str = r#"link[rel="preload"][type="application/wasm"][media="not all"]"#;
/// Запасная пауза для браузеров без `requestIdleCallback` (Safari).
const FALLBACK_DELAY: Duration = Duration::from_secs(1);

/// Запускает докачку после события `load`.
pub fn prefetch_lazy_islands() {
    if document().ready_state() == "complete" {
        when_idle();
    } else {
        // `load` случается один раз; слушатель крошечный, снимать его незачем.
        let _ = window_event_listener(leptos::ev::load, move |_| when_idle());
    }
}

/// Откладывает докачку до простоя браузера.
fn when_idle() {
    if request_idle_callback_with_handle(fetch_all).is_err() {
        set_timeout(fetch_all, FALLBACK_DELAY);
    }
}

/// Запрашивает каждый файл и дочитывает ответ: только полный ответ остаётся в кэше.
fn fetch_all() {
    let Ok(links) = document().query_selector_all(SELECTOR) else {
        return;
    };
    let read_body = Closure::<dyn FnMut(JsValue)>::new(|response: JsValue| {
        if let Ok(response) = response.dyn_into::<Response>() {
            let _ = response.array_buffer();
        }
    });
    for index in 0..links.length() {
        let Some(link) = links
            .get(index)
            .and_then(|node| node.dyn_into::<HtmlLinkElement>().ok())
        else {
            continue;
        };
        let _ = window().fetch_with_str(&link.href()).then(&read_body);
    }
    // Замыкание вызывается после выхода из функции, поэтому живёт до конца страницы.
    read_body.forget();
}

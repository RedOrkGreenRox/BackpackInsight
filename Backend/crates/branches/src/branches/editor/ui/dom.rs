//! Обращения к странице: размеры элементов, точка захвата, захват указателя,
//! адресная строка и настройки в `localStorage`.
//!
//! Работают только в браузере (`hydrate`); при рендере на сервере это заглушки.

use super::state::Rect;
use leptos::{html, prelude::*};

/// Прямоугольник элемента на экране; `None`, если узла нет.
#[must_use]
pub fn rect(node: NodeRef<html::Div>) -> Option<Rect> {
    #[cfg(feature = "hydrate")]
    {
        let r = node.get_untracked()?.get_bounding_client_rect();
        Some(Rect {
            left: r.left(),
            top: r.top(),
            width: r.width(),
            height: r.height(),
        })
    }
    #[cfg(not(feature = "hydrate"))]
    {
        let _ = node;
        None
    }
}

/// Где внутри элемента под событием нажали: доли ширины и высоты, 0..1.
#[must_use]
pub fn grab(ev: &leptos::ev::PointerEvent) -> (f64, f64) {
    #[cfg(feature = "hydrate")]
    {
        use wasm_bindgen::JsCast;
        let element = ev
            .current_target()
            .and_then(|target| target.dyn_into::<web_sys::Element>().ok());
        if let Some(element) = element {
            let r = element.get_bounding_client_rect();
            if r.width() > 0.0 && r.height() > 0.0 {
                let x = (f64::from(ev.client_x()) - r.left()) / r.width();
                let y = (f64::from(ev.client_y()) - r.top()) / r.height();
                return (x.clamp(0.0, 1.0), y.clamp(0.0, 1.0));
            }
        }
    }
    let _ = ev;
    (0.5, 0.5)
}

/// Все движения указателя `ev` идут элементу под ним, даже за его краем (для ручек размера).
pub fn capture(ev: &leptos::ev::PointerEvent) {
    #[cfg(feature = "hydrate")]
    {
        use wasm_bindgen::JsCast;
        if let Some(element) = ev
            .current_target()
            .and_then(|target| target.dyn_into::<web_sys::Element>().ok())
        {
            let _ = element.set_pointer_capture(ev.pointer_id());
        }
    }
    let _ = ev;
}

/// Настройка из `localStorage`; `None`, если её нет или хранилище недоступно.
#[must_use]
pub fn pref(key: &str) -> Option<String> {
    #[cfg(feature = "hydrate")]
    {
        window()
            .local_storage()
            .ok()
            .flatten()?
            .get_item(key)
            .ok()
            .flatten()
    }
    #[cfg(not(feature = "hydrate"))]
    {
        let _ = key;
        None
    }
}

/// Сохраняет настройку; пустое значение её убирает. Ошибки хранилища не мешают работе.
pub fn set_pref(key: &str, value: &str) {
    #[cfg(feature = "hydrate")]
    if let Some(storage) = window().local_storage().ok().flatten() {
        let _ = if value.is_empty() {
            storage.remove_item(key)
        } else {
            storage.set_item(key, value)
        };
    }
    #[cfg(not(feature = "hydrate"))]
    let _ = (key, value);
}

/// Ставит параметры адреса без перезагрузки; пустое значение убирает параметр.
pub fn replace_query(pairs: &[(&str, String)]) {
    #[cfg(feature = "hydrate")]
    {
        let Some(url) = window()
            .location()
            .href()
            .ok()
            .and_then(|href| web_sys::Url::new(&href).ok())
        else {
            return;
        };
        let params = url.search_params();
        for (name, value) in pairs {
            if value.is_empty() {
                params.delete(name);
            } else {
                params.set(name, value);
            }
        }
        if url.href() != window().location().href().unwrap_or_default() {
            if let Ok(history) = window().history() {
                let _ = history.replace_state_with_url(
                    &wasm_bindgen::JsValue::NULL,
                    "",
                    Some(&url.href()),
                );
            }
        }
    }
    #[cfg(not(feature = "hydrate"))]
    let _ = pairs;
}

/// `data:`-ссылка на JSON для кнопки «Скачать».
#[must_use]
pub fn json_data_url(json: &str) -> String {
    use std::fmt::Write;
    let mut out = String::from("data:application/json;charset=utf-8,");
    for byte in json.bytes() {
        if byte.is_ascii_alphanumeric() || b"-_.~".contains(&byte) {
            out.push(char::from(byte));
        } else {
            let _ = write!(out, "%{byte:02X}");
        }
    }
    out
}

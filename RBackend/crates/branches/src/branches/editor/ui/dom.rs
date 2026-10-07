//! Обращения к странице: размеры элементов, точка захвата, адресная строка.
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
    let mut out = String::from("data:application/json;charset=utf-8,");
    for byte in json.bytes() {
        if byte.is_ascii_alphanumeric() || b"-_.~".contains(&byte) {
            out.push(char::from(byte));
        } else {
            out.push_str(&format!("%{byte:02X}"));
        }
    }
    out
}

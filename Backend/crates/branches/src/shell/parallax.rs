//! `ParallaxManager` — фон чуть смещается за курсором (перенос `ground/roots/Parallax.ts`).
//!
//! Остров ничего не рисует: он только вешает обработчик `mousemove` на окно и
//! двигает `#bgImg`. Islands router не трогает острова при переходах, поэтому
//! обработчик живёт всё время, пока открыт сайт.

use leptos::prelude::*;

/// Сила смещения, как в TS-версии.
const INTENSITY: f64 = 1.5;
/// Не чаще одного пересчёта за столько миллисекунд.
const THROTTLE_MS: f64 = 20.0;

/// Остров параллакса фона.
#[island]
#[allow(clippy::must_use_candidate)]
pub fn ParallaxManager() -> impl IntoView {
    let origin = StoredValue::new(None::<(f64, f64)>);
    let last = StoredValue::new(0.0_f64);
    let handle = window_event_listener(leptos::ev::mousemove, move |ev| {
        let now = ev.time_stamp();
        if now - last.get_value() < THROTTLE_MS {
            return;
        }
        last.set_value(now);
        let point = (f64::from(ev.client_x()), f64::from(ev.client_y()));
        match origin.get_value() {
            None => origin.set_value(Some(point)),
            Some(start) => shift_background(start, point),
        }
    });
    on_cleanup(move || handle.remove());
}

/// Сдвигает картинку фона в процентах от размера окна.
fn shift_background(start: (f64, f64), point: (f64, f64)) {
    #[cfg(feature = "hydrate")]
    {
        use wasm_bindgen::JsCast;
        let Some(img) = document()
            .get_element_by_id("bgImg")
            .and_then(|el| el.dyn_into::<web_sys::HtmlElement>().ok())
        else {
            return;
        };
        let width = window()
            .inner_width()
            .ok()
            .and_then(|v| v.as_f64())
            .unwrap_or(1.0);
        let height = window()
            .inner_height()
            .ok()
            .and_then(|v| v.as_f64())
            .unwrap_or(1.0);
        let factor = 100.0 * (INTENSITY / 50.0);
        let x = -((point.0 - start.0) / width) * factor;
        let y = -((point.1 - start.1) / height) * factor;
        let _ = img.style().set_property(
            "transform",
            &format!("translate(-50%, -50%) translate({x}%, {y}%) scale(1.1)"),
        );
    }
    #[cfg(not(feature = "hydrate"))]
    let _ = (start, point, INTENSITY);
}

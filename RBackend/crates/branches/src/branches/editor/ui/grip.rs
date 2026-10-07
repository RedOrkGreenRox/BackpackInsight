//! Ручка размера: край поля или каталога, который тянут мышью вниз и вверх.
//!
//! Только для мыши (на сенсорных экранах `_panels.scss` её прячет). Двойной щелчок
//! возвращает размер «по экрану»; стрелки вверх и вниз меняют его с клавиатуры.

use super::dom::capture;
use leptos::prelude::*;

/// Шаг стрелок клавиатуры, px указателя.
const KEY_STEP: f64 = 16.0;

/// Ручка, меняющая `value`.
///
/// - `current` — значение сейчас (меряется на странице), если `value` ещё `None`;
/// - `per_px` — на сколько меняется значение за пиксель движения указателя вниз;
/// - `min`, `max` — границы значения.
#[component]
#[allow(clippy::must_use_candidate, clippy::too_many_arguments)]
pub fn Grip(
    value: RwSignal<Option<f64>>,
    #[prop(into)] current: Callback<(), Option<f64>>,
    per_px: f64,
    min: f64,
    max: f64,
    label: String,
    class: &'static str,
) -> impl IntoView {
    let from = StoredValue::new(None::<(f64, f64)>);
    let base = move || value.get_untracked().or_else(|| current.run(()));
    let shift = move |start: f64, px: f64| value.set(Some((start + px * per_px).clamp(min, max)));
    view! {
        <div
            class=format!("ed-grip {class}")
            role="separator"
            aria-orientation="horizontal"
            aria-label=label.clone()
            title=label
            tabindex="0"
            on:pointerdown=move |ev| {
                if ev.button() != 0 {
                    return;
                }
                if let Some(start) = base() {
                    capture(&ev);
                    ev.prevent_default();
                    from.set_value(Some((f64::from(ev.client_y()), start)));
                }
            }
            on:pointermove=move |ev| {
                if let Some((y, start)) = from.get_value() {
                    shift(start, f64::from(ev.client_y()) - y);
                }
            }
            on:pointerup=move |_| from.set_value(None)
            on:pointercancel=move |_| from.set_value(None)
            on:dblclick=move |_| value.set(None)
            on:keydown=move |ev| {
                let px = match ev.key().as_str() {
                    "ArrowDown" => KEY_STEP,
                    "ArrowUp" => -KEY_STEP,
                    _ => return,
                };
                ev.prevent_default();
                if let Some(start) = base() {
                    shift(start, px);
                }
            }
        ></div>
    }
}

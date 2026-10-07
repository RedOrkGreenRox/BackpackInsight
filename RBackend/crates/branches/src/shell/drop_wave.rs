//! Затухающая волна по соседям «капли» меню.
//!
//! Когда меню закрыто, пункт в фокусе выпускает из края экрана каплю
//! (`.nav-drop`, стили в `shell/sidebar/_sidebar.scss`). Здесь соседние пункты
//! отвечают ей волной: их капли коротко выглядывают из края, и чем дальше
//! сосед, тем позже и слабее. Волна идёт и при выходе капли, и при её возврате.

use leptos::prelude::document;
use wasm_bindgen::JsCast;
use web_sys::{Element, FocusEvent};

/// Класс, который запускает анимацию волны у капли.
const WAVING: &str = "waving";
/// Насколько выглядывает капля соседа на расстоянии 1, 2, ... (доля ширины).
const AMPLITUDES: &[u8] = &[55, 25];
/// Задержка волны на каждый шаг от пункта в фокусе, мс.
const STEP_MS: usize = 70;

/// Фокус пришёл в пункт закрытого меню: капля выходит, соседи отвечают.
pub fn on_focus_in(ev: &FocusEvent) {
    if let Some(tab) = tab_of(ev.target()) {
        ripple_around(&tab);
    }
}

/// Фокус ушёл из меню совсем: капля уходит обратно, соседи отвечают.
/// Переход фокуса на другой пункт меню обработает `focusin`.
pub fn on_focus_out(ev: &FocusEvent) {
    let stays_inside = tab_of(ev.related_target()).is_some();
    if stays_inside {
        return;
    }
    if let Some(tab) = tab_of(ev.target()) {
        ripple_around(&tab);
    }
}

/// Пункт закрытого меню, к которому относится узел.
fn tab_of(target: Option<web_sys::EventTarget>) -> Option<Element> {
    target
        .and_then(|node| node.dyn_into::<Element>().ok())
        .and_then(|el| el.closest("#sidebar:not(.open) .nav-tab").ok().flatten())
}

fn ripple_around(tab: &Element) {
    let Ok(list) = document().query_selector_all("#sidebar .nav-tab") else {
        return;
    };
    let tabs: Vec<Element> = (0..list.length())
        .filter_map(|i| list.item(i))
        .filter_map(|node| node.dyn_into::<Element>().ok())
        .collect();
    let Some(center) = tabs.iter().position(|el| el == tab) else {
        return;
    };
    for (index, other) in tabs.iter().enumerate() {
        let distance = index.abs_diff(center);
        if distance == 0 {
            // Своя капля не волнуется: анимация перебила бы её выход и возврат.
            stop_wave(other);
        } else if let Some(amp) = distance.checked_sub(1).and_then(|i| AMPLITUDES.get(i)) {
            wave(other, *amp, distance * STEP_MS);
        }
    }
}

fn stop_wave(tab: &Element) {
    if let Ok(Some(drop)) = tab.query_selector(".nav-drop") {
        let _ = drop.class_list().remove_1(WAVING);
    }
}

/// Перезапускает анимацию волны у капли пункта.
fn wave(tab: &Element, amp: u8, delay_ms: usize) {
    let Ok(Some(drop)) = tab.query_selector(".nav-drop") else {
        return;
    };
    let _ = drop.class_list().remove_1(WAVING);
    // Чтение размеров заставляет браузер применить снятие класса, и анимация
    // начнётся заново, даже если предыдущая волна ещё не закончилась.
    let _ = drop.get_bounding_client_rect();
    let style = format!("--wave-amp: {amp}%; animation-delay: {delay_ms}ms");
    let _ = drop.set_attribute("style", &style);
    let _ = drop.class_list().add_1(WAVING);
}

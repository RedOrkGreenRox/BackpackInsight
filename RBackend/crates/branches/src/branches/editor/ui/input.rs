//! Управление перетаскиванием: мышь, касания и клавиатура.
//!
//! - ЛКМ (или палец) зажать и тащить;
//! - повернуть: ПКМ, СКМ, пробел или `R`, а на телефоне — коснуться экрана вторым пальцем;
//! - `Esc` — вернуть предмет на место.

use super::{
    dom::{grab, rect},
    drag::{Drag, Origin, THRESHOLD},
    drop::{finish, lift},
    state::Editor,
};
use leptos::prelude::*;

/// Нажатие на предмет: запоминает, что и откуда взяли.
pub fn start(editor: Editor, origin: Origin, piece: usize, ev: &leptos::ev::PointerEvent) {
    if ev.button() != 0 || editor.drag.with_untracked(Option::is_some) {
        return;
    }
    let orient = match origin {
        Origin::Item(i) => editor
            .board
            .with_untracked(|b| b.items.get(i).map(|p| p.orient)),
        Origin::Bag(i) => editor
            .board
            .with_untracked(|b| b.bags.get(i).map(|p| p.orient)),
        Origin::Catalog | Origin::Storage(_) => None,
    };
    let point = (f64::from(ev.client_x()), f64::from(ev.client_y()));
    editor.pointer.set(point);
    editor.hover.set(None);
    editor.drag.set(Some(Drag {
        piece,
        orient: orient.unwrap_or_default(),
        grab: if origin == Origin::Catalog {
            (0.5, 0.5)
        } else {
            grab(ev)
        },
        pointer_id: ev.pointer_id(),
        start: point,
        origin,
        lifted: None,
    }));
}

/// Поворачивает перетаскиваемый предмет.
fn rotate(editor: Editor) {
    editor.drag.update(|drag| {
        if let Some(drag) = drag.as_mut().filter(|d| d.lifted.is_some()) {
            drag.rotate();
        }
    });
}

/// Заканчивает перетаскивание.
fn end(editor: Editor, cancel: bool) {
    if let Some(drag) = editor.drag.get_untracked() {
        editor.drag.set(None);
        finish(editor, drag, cancel);
    }
}

/// Слушатели окна на время жизни острова.
pub fn listen(editor: Editor) {
    let active = move || {
        editor
            .drag
            .with_untracked(|d| d.as_ref().is_some_and(|d| d.lifted.is_some()))
    };
    let ours = move |id: i32| {
        editor
            .drag
            .with_untracked(|d| d.as_ref().is_some_and(|d| d.pointer_id == id))
    };
    let handles = [
        window_event_listener(leptos::ev::pointermove, move |ev| {
            if !ours(ev.pointer_id()) {
                return;
            }
            let point = (f64::from(ev.client_x()), f64::from(ev.client_y()));
            editor.pointer.set(point);
            let Some(mut drag) = editor.drag.get_untracked().filter(|d| d.lifted.is_none()) else {
                return;
            };
            if (point.0 - drag.start.0).hypot(point.1 - drag.start.1) >= THRESHOLD {
                let cell = rect(editor.field).map_or(0.0, |r| r.width / 9.0);
                editor.cell_px.set(cell);
                lift(editor, &mut drag);
                editor.drag.set(drag.lifted.is_some().then_some(drag));
            }
        }),
        window_event_listener(leptos::ev::pointerup, move |ev| {
            if ours(ev.pointer_id()) {
                end(editor, false);
            }
        }),
        window_event_listener(leptos::ev::pointercancel, move |ev| {
            if ours(ev.pointer_id()) {
                end(editor, true);
            }
        }),
        // Второй палец во время перетаскивания поворачивает предмет.
        window_event_listener(leptos::ev::pointerdown, move |ev| {
            if active() && !ours(ev.pointer_id()) && ev.pointer_type() == "touch" {
                rotate(editor);
            }
        }),
        // ПКМ и СКМ при зажатой ЛКМ приходят как mousedown, а не pointerdown.
        window_event_listener(leptos::ev::mousedown, move |ev| {
            if active() && ev.button() != 0 {
                ev.prevent_default();
                rotate(editor);
            }
        }),
        window_event_listener(leptos::ev::contextmenu, move |ev| {
            if editor.drag.with_untracked(Option::is_some) {
                ev.prevent_default();
            }
        }),
        window_event_listener(leptos::ev::keydown, move |ev| {
            if !active() {
                return;
            }
            match ev.key().as_str() {
                " " | "r" | "R" | "к" | "К" => {
                    ev.prevent_default();
                    rotate(editor);
                }
                "Escape" => end(editor, true),
                _ => {}
            }
        }),
    ];
    on_cleanup(move || handles.into_iter().for_each(|handle| handle.remove()));
}

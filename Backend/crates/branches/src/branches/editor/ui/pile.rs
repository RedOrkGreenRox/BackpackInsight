//! Склад с гравитацией: тела [`Pile`] под рисунком склада.
//!
//! Тела сверяются со списком склада при каждом изменении билда, затем кадры
//! `requestAnimationFrame` двигают их, пока всё не ляжет. Высота склада — куча
//! плюс строка сверху. Позиции — в клетках склада, CSS переводит их в размеры.

use super::{
    dom::rect,
    drag::Origin,
    input::start,
    piece::{size_style, PieceArt},
    state::{Editor, Rect, Spawn},
};
use crate::branches::editor::model::{pile::MIN_ROWS, Kit, Orientation};
use leptos::{html, prelude::*};

/// Клетка склада от клетки поля (как `--cell` в `_panels.scss`).
pub const STASH_SCALE: f64 = 0.7;
/// Шаг физики, с.
const DT: f64 = 1.0 / 60.0;

/// Клетка склада, px (по ширине поля).
fn stash_cell(editor: Editor) -> Option<f64> {
    rect(editor.field)
        .map(|r| r.width / 9.0 * STASH_SCALE)
        .filter(|c| *c > 0.0)
}

/// Ширина зоны в клетках склада; до первого измерения — 8.
fn width(area: Option<Rect>, cell: Option<f64>) -> f64 {
    area.zip(cell).map_or(8.0, |(r, c)| r.width / c)
}

/// Подсказка `spawn` в клетках: левый нижний угол формы предмета `piece`.
fn spawn_cells(kit: &Kit, piece: usize, spawn: Spawn, area: Rect, cell: f64) -> (f64, f64) {
    let (pointer, grab) = spawn;
    let b = kit.item(piece).bounds();
    let (w, h) = (f64::from(b.width()) * cell, f64::from(b.height()) * cell);
    let left = pointer.0 - grab.0 * w;
    let bottom = pointer.1 - grab.1 * h + h;
    (
        (left - area.left) / cell,
        (area.top + area.height - bottom) / cell,
    )
}

/// Двигает тела кадр за кадром, пока что-то падает.
fn animate(editor: Editor, area: NodeRef<html::Div>, running: StoredValue<bool>) {
    if running.get_value() {
        return;
    }
    running.set_value(true);
    frame(editor, area, running);
}

fn frame(editor: Editor, area: NodeRef<html::Div>, running: StoredValue<bool>) {
    request_animation_frame(move || {
        let Some(kit) = editor.kit_now() else {
            running.set_value(false);
            return;
        };
        let w = width(rect(area), stash_cell(editor));
        let mut moving = false;
        editor.pile.update(|p| moving = p.step(&kit, w, DT));
        if moving {
            frame(editor, area, running);
        } else {
            running.set_value(false);
        }
    });
}

/// Зона склада с гравитацией.
#[component]
#[allow(clippy::must_use_candidate)]
pub fn PileArea() -> impl IntoView {
    let editor = Editor::get();
    let area = NodeRef::<html::Div>::new();
    let running = StoredValue::new(false);
    Effect::new(move |_| {
        let Some(kit) = editor.kit.get() else { return };
        let storage = editor.board.with(|b| b.storage.clone());
        let (zone, cell) = (rect(area), stash_cell(editor));
        let spawn = editor
            .spawn
            .get_value()
            .zip(storage.last())
            .zip(zone.zip(cell));
        let hint = spawn.map(|((s, &piece), (z, c))| spawn_cells(&kit, piece, s, z, c));
        editor.spawn.set_value(None);
        editor
            .pile
            .update(|p| p.reconcile(&kit, &storage, hint, width(zone, cell)));
        animate(editor, area, running);
    });
    let resize = window_event_listener(leptos::ev::resize, move |_| animate(editor, area, running));
    on_cleanup(move || resize.remove());
    let rows = move || {
        let rows = editor
            .kit
            .get()
            .map_or(MIN_ROWS, |kit| editor.pile.with(|p| p.rows(&kit)));
        format!("height:calc(var(--cell)*{rows})")
    };
    let bodies = move || {
        editor.pile.with(|p| {
            p.bodies
                .iter()
                .map(|b| b.piece)
                .enumerate()
                .collect::<Vec<_>>()
        })
    };
    view! {
        <div class="ed-pile" node_ref=area style=rows>
            <For each=bodies key=|entry| *entry children=move |(i, piece)| view! { <PileBody index=i piece/> }/>
        </div>
    }
}

/// Предмет на складе с гравитацией.
#[component]
#[allow(clippy::must_use_candidate)]
fn PileBody(index: usize, piece: usize) -> impl IntoView {
    let editor = Editor::get();
    let Some(kit) = editor.kit_now() else {
        return ().into_any();
    };
    let item = kit.item(piece).clone();
    let name = item.name.clone();
    let b = item.bounds();
    let size = size_style(b.width(), b.height());
    let style = move || {
        editor.pile.with(|p| {
            p.bodies.get(index).map_or_else(String::new, |body| {
                format!(
                    "{size};left:calc(var(--cell)*{});bottom:calc(var(--cell)*{})",
                    body.x, body.y
                )
            })
        })
    };
    view! {
        <div
            class="ed-stored ed-body"
            style=style
            title=name
            on:pointerdown=move |ev| start(editor, Origin::Storage(index), piece, &ev)
        >
            <PieceArt item orient=Orientation::Up placed=true/>
        </div>
    }
    .into_any()
}

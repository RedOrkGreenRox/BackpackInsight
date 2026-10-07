//! Поле рюкзака 9 × 6 в рамке из игры: слой сумок, слой предметов и слой подсветки.
//!
//! Клетки нарисованы на фоне рамки (`images/editor/inventory`), в режиме сумок фон оранжевый.

use super::{
    drag::Origin,
    input::start,
    marks::Marks,
    piece::{box_style, PieceArt},
    state::Editor,
};
use crate::branches::editor::model::{Bounds, Placed};
use leptos::prelude::*;

/// Поле.
#[component]
#[allow(clippy::must_use_candidate)]
pub fn Field(label: String) -> impl IntoView {
    let editor = Editor::get();
    let bags = move || {
        editor
            .board
            .with(|b| b.bags.iter().copied().enumerate().collect::<Vec<_>>())
    };
    let items = move || {
        editor
            .board
            .with(|b| b.items.iter().copied().enumerate().collect::<Vec<_>>())
    };
    view! {
        <div class="ed-frame" class:ed-frame-bags=move || editor.board.with(|b| b.bag_mode)>
            <div class="ed-field" node_ref=editor.field role="grid" aria-label=label>
                <div class="ed-layer ed-bags">
                    <For each=bags key=|entry| *entry children=move |(i, p)| view! { <FieldPiece placed=p origin=Origin::Bag(i)/> }/>
                </div>
                <div class="ed-layer ed-items" class:ed-ghosted=move || editor.board.with(|b| b.bag_mode)>
                    <For each=items key=|entry| *entry children=move |(i, p)| view! { <FieldPiece placed=p origin=Origin::Item(i)/> }/>
                </div>
                <Marks/>
            </div>
        </div>
    }
}

/// Сумка или предмет на поле.
#[component]
#[allow(clippy::must_use_candidate)]
fn FieldPiece(placed: Placed, origin: Origin) -> impl IntoView {
    let editor = Editor::get();
    let Some(kit) = editor.kit_now() else {
        return ().into_any();
    };
    let item = kit.item(placed.piece).clone();
    let name = item.name.clone();
    let Some(b) = Bounds::of(&placed.cells(&kit)) else {
        return ().into_any();
    };
    view! {
        <div
            class="ed-piece"
            style=box_style(b)
            title=name
            on:pointerdown=move |ev| start(editor, origin, placed.piece, &ev)
            on:pointerenter=move |_| editor.hover.set(Some(placed))
            on:pointerleave=move |_| editor.hover.set(None)
        >
            <PieceArt item orient=placed.orient placed=true/>
        </div>
    }
    .into_any()
}

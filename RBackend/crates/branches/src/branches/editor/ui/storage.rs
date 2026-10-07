//! Склад: предметы, которые не на поле, списком в порядке поступления.

use super::{
    drag::Origin,
    input::start,
    piece::{size_style, PieceArt},
    state::Editor,
};
use crate::branches::editor::model::Orientation;
use leptos::prelude::*;

/// Склад.
#[component]
#[allow(clippy::must_use_candidate)]
pub fn Storage(title: String, empty: String) -> impl IntoView {
    let editor = Editor::get();
    let stored = move || {
        editor
            .board
            .with(|b| b.storage.iter().copied().enumerate().collect::<Vec<_>>())
    };
    let is_empty = move || editor.board.with(|b| b.storage.is_empty());
    view! {
        <div class="ed-storage" role="region" node_ref=editor.storage aria-label=title.clone()>
            <h2 class="ed-heading">{title.clone()}</h2>
            <Show when=is_empty>
                <p class="ed-storage-empty">{empty.clone()}</p>
            </Show>
            <div class="ed-storage-list">
                <For each=stored key=|entry| *entry children=move |(i, piece)| view! { <Stored index=i piece/> }/>
            </div>
        </div>
    }
}

/// Предмет на складе.
#[component]
#[allow(clippy::must_use_candidate)]
fn Stored(index: usize, piece: usize) -> impl IntoView {
    let editor = Editor::get();
    let Some(kit) = editor.kit_now() else {
        return ().into_any();
    };
    let item = kit.item(piece).clone();
    let name = item.name.clone();
    let b = item.bounds();
    view! {
        <div
            class="ed-stored"
            style=size_style(b.width(), b.height())
            title=name
            on:pointerdown=move |ev| start(editor, Origin::Storage(index), piece, &ev)
        >
            <PieceArt item orient=Orientation::Up/>
        </div>
    }
    .into_any()
}

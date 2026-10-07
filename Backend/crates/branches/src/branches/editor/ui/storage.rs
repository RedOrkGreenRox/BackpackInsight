//! Склад: предметы, которые не на поле. Два вида: свободная зона с гравитацией
//! ([`PileArea`]) и список в порядке поступления; высота растёт по содержимому.

use super::{
    drag::Origin,
    input::start,
    piece::{size_style, PieceArt},
    pile::PileArea,
    state::{Editor, StashMode},
};
use crate::branches::editor::model::Orientation;
use leptos::prelude::*;

/// Склад; `title` — имя области для экранных дикторов.
#[component]
#[allow(clippy::must_use_candidate)]
pub fn Storage(title: String) -> impl IntoView {
    let editor = Editor::get();
    let stored = move || {
        editor
            .board
            .with(|b| b.storage.iter().copied().enumerate().collect::<Vec<_>>())
    };
    let list = move || {
        view! {
            <div class="ed-storage-list">
                <For each=stored key=|entry| *entry children=move |(i, piece)| view! { <Stored index=i piece/> }/>
            </div>
        }
    };
    view! {
        <div class="ed-storage" role="region" node_ref=editor.storage aria-label=title>
            <Show when=move || editor.stash.get() == StashMode::Gravity fallback=list>
                <PileArea/>
            </Show>
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
            <PieceArt item orient=Orientation::Up placed=true/>
        </div>
    }
    .into_any()
}

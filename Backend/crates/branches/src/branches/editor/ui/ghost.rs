//! Предмет под указателем во время перетаскивания. У сумки вне режима сумок
//! рисуются и предметы, которые она несёт.
//!
//! Положение блока меняется с каждым движением указателя, а содержимое — только
//! при повороте, поэтому картинки не пересоздаются.

use super::{
    drag::Lifted,
    piece::{box_style, PieceArt},
    state::Editor,
};
use crate::branches::editor::model::{Bounds, Cell, Placed, HEIGHT};
use leptos::prelude::*;

/// Клетка, если поле ещё не измерено, px.
const FALLBACK_CELL: f64 = 48.0;

/// Слой перетаскиваемого предмета.
#[component]
#[allow(clippy::must_use_candidate)]
pub fn Ghost() -> impl IntoView {
    let editor = Editor::get();
    let cell = move || {
        let px = editor.cell_px.get();
        if px > 0.0 {
            px
        } else {
            FALLBACK_CELL
        }
    };
    let active = move || {
        editor
            .drag
            .with(|d| d.as_ref().is_some_and(|d| d.lifted.is_some()))
    };
    let place_style = move || {
        let (Some(drag), Some(kit)) = (editor.drag.get(), editor.kit.get()) else {
            return String::new();
        };
        let (left, top) = drag.corner(&kit, editor.pointer.get(), cell());
        format!("--cell:{}px;transform:translate({left}px,{top}px)", cell())
    };
    let content = move || {
        let drag = editor.drag.get()?;
        let kit = editor.kit.get()?;
        let b = drag.bounds(&kit);
        let frame = Placed {
            piece: drag.piece,
            pos: Cell::new(-b.min.x, HEIGHT - 1 - b.max.y),
            orient: drag.orient,
        };
        let mut pieces = vec![frame];
        if let Some(Lifted::Bag(from, carried)) = &drag.lifted {
            pieces.extend(carried.iter().map(|item| item.carried(from, &frame)));
        }
        Some(
            pieces
                .into_iter()
                .filter_map(|p| {
                    let style = box_style(Bounds::of(&p.cells(&kit))?);
                    let item = kit.item(p.piece).clone();
                    Some(view! { <div class="ed-piece" style=style><PieceArt item orient=p.orient placed=true/></div> })
                })
                .collect_view(),
        )
    };
    view! {
        <Show when=active>
            <div class="ed-ghost" style=place_style aria-hidden="true">{content}</div>
        </Show>
    }
}

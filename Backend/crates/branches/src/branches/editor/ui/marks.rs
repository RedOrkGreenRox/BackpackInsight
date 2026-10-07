//! Подсветка на поле: куда встанет перетаскиваемый предмет (зелёным или красным)
//! и его звёзды; без перетаскивания — звёзды предмета под указателем.

use super::{dom::rect, piece::box_style, state::Editor};
use crate::branches::editor::model::{place, Bounds, Cell, Kit, Placed};
use leptos::prelude::*;

/// Вид отметки на клетке.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Mark {
    /// Предмет встанет сюда.
    Fits,
    /// Сюда предмет не встанет.
    Blocked,
    /// Клетка-звезда предмета.
    Star,
}

impl Mark {
    fn class(self) -> &'static str {
        match self {
            Self::Fits => "ed-mark ed-mark-fits",
            Self::Blocked => "ed-mark ed-mark-blocked",
            Self::Star => "ed-mark ed-mark-star",
        }
    }
}

/// Отметки для предмета `placed`: клетки формы (если `fits` задан) и звёзды на поле.
#[must_use]
pub fn marks(kit: &Kit, placed: &Placed, fits: Option<bool>) -> Vec<(Cell, Mark)> {
    let item = kit.item(placed.piece);
    let shape = fits.map(|ok| if ok { Mark::Fits } else { Mark::Blocked });
    let body = shape
        .into_iter()
        .flat_map(|mark| placed.cells(kit).into_iter().map(move |c| (c, mark)));
    let stars = if item.is_bag() {
        Vec::new()
    } else {
        place(&item.stars, placed.pos, placed.orient)
    };
    body.chain(stars.into_iter().map(|c| (c, Mark::Star)))
        .filter(|(c, _)| c.on_field())
        .collect()
}

/// Слой отметок.
#[component]
#[allow(clippy::must_use_candidate)]
pub fn Marks() -> impl IntoView {
    let editor = Editor::get();
    let current = Memo::new(move |_| {
        let kit = editor.kit.get()?;
        let Some(drag) = editor.drag.get().filter(|d| d.lifted.is_some()) else {
            let hovered = editor.hover.get()?;
            return Some(marks(&kit, &hovered, None));
        };
        let field = rect(editor.field)?;
        let target = drag.target(&kit, editor.pointer.get(), field, editor.cell_px.get())?;
        let fits = editor.board.with(|b| b.fits(&kit, &target));
        Some(marks(&kit, &target, Some(fits)))
    });
    view! {
        <div class="ed-layer ed-marks" aria-hidden="true">
            {move || {
                current
                    .get()
                    .unwrap_or_default()
                    .into_iter()
                    .map(|(cell, mark)| {
                        let style = box_style(Bounds { min: cell, max: cell });
                        view! { <div class=mark.class() style=style></div> }
                    })
                    .collect_view()
            }}
        </div>
    }
}

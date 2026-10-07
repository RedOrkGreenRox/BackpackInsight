//! Снять предмет в начале перетаскивания и положить его в конце.
//!
//! Куда кладём, решает место отпускания: поле (если предмет туда встаёт),
//! склад, каталог (предмет убирается) или откуда взяли.

use super::{
    dom::rect,
    drag::{Drag, Lifted, Origin},
    state::Editor,
};
use crate::branches::editor::model::{Board, Kit, Placed};

/// Снимает предмет с того места, откуда его взяли.
pub fn lift(editor: Editor, drag: &mut Drag) {
    let mut lifted = None;
    editor.edit(|kit, board| {
        lifted = match drag.origin {
            Origin::Catalog => Some(Lifted::Catalog),
            Origin::Storage(index) => board.take_stored(index).map(|_| Lifted::Storage),
            Origin::Item(index) => board.lift_item(index).map(Lifted::Item),
            Origin::Bag(index) => board
                .lift_bag(kit, index)
                .map(|(bag, carried)| Lifted::Bag(bag, carried)),
        };
    });
    drag.lifted = lifted;
}

/// Кладёт предмет туда, где отпустили указатель (`cancel` — вернуть на место).
pub fn finish(editor: Editor, drag: Drag, cancel: bool) {
    let Some(lifted) = drag.lifted.clone() else {
        return;
    };
    let pointer = editor.pointer.get_untracked();
    let over = |node| rect(node).is_some_and(|r| r.contains(pointer));
    let target = rect(editor.field).and_then(|field| {
        let kit = editor.kit_now()?;
        drag.target(&kit, pointer, field, editor.cell_px.get_untracked())
    });
    let to_storage = !cancel && over(editor.storage);
    let to_catalog = !cancel && over(editor.catalog);
    editor.edit(|kit, board| {
        let placed = target.filter(|t| !cancel && board.fits(kit, t));
        match (placed, &lifted) {
            (Some(at), Lifted::Bag(from, carried)) => {
                let moved = carried.iter().map(|item| item.carried(from, &at)).collect();
                board.drop_bag(kit, at, moved);
            }
            (Some(at), _) if kit.item(at.piece).is_bag() => board.drop_bag(kit, at, Vec::new()),
            (Some(at), _) => board.drop_item(kit, at),
            (None, _) if to_storage => store(board, drag.piece, &lifted),
            (None, Lifted::Bag(_, carried)) if to_catalog => {
                board.storage.extend(carried.iter().map(|item| item.piece));
            }
            (None, _) if to_catalog => {}
            (None, _) => give_back(kit, board, drag.piece, lifted.clone()),
        }
    });
}

/// На склад: предмет, а у сумки — и всё, что она несла.
fn store(board: &mut Board, piece: usize, lifted: &Lifted) {
    board.storage.push(piece);
    if let Lifted::Bag(_, carried) = lifted {
        board
            .storage
            .extend(carried.iter().map(|item: &Placed| item.piece));
    }
}

/// Возвращает предмет туда, откуда взяли; новый из каталога просто исчезает.
fn give_back(kit: &Kit, board: &mut Board, piece: usize, lifted: Lifted) {
    match lifted {
        Lifted::Catalog => {}
        Lifted::Storage => board.storage.push(piece),
        Lifted::Item(at) => board.drop_item(kit, at),
        Lifted::Bag(at, carried) => board.drop_bag(kit, at, carried),
    }
}

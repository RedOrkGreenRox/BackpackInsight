//! [`Drag`] — перетаскиваемый предмет и расчёт клетки, куда он встанет.
//!
//! Перетаскивание начинается с нажатия, но предмет снимается с поля или склада
//! только когда указатель сдвинулся: простой клик ничего не меняет.

use super::state::Rect;
use crate::branches::editor::model::{place, Bounds, Cell, Kit, Orientation, Placed, HEIGHT};

/// Откуда взяли предмет (номер — в списке поля или склада на момент нажатия).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Origin {
    /// Из каталога: новый предмет.
    Catalog,
    /// Со склада.
    Storage(usize),
    /// Предмет с поля.
    Item(usize),
    /// Сумка с поля.
    Bag(usize),
}

/// Что сняли, когда перетаскивание началось: туда же всё вернётся при отмене.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Lifted {
    /// Новый предмет из каталога.
    Catalog,
    /// Предмет со склада.
    Storage,
    /// Предмет с поля.
    Item(Placed),
    /// Сумка с поля и предметы, которые она несёт.
    Bag(Placed, Vec<Placed>),
}

/// Перетаскивание.
#[derive(Clone, Debug, PartialEq)]
pub struct Drag {
    /// Номер предмета в наборе.
    pub piece: usize,
    /// Текущий поворот.
    pub orient: Orientation,
    /// Где указатель держит предмет: доли ширины и высоты охвата, 0..1 от левого верхнего угла.
    pub grab: (f64, f64),
    /// Указатель, который тащит.
    pub pointer_id: i32,
    /// Точка нажатия, px.
    pub start: (f64, f64),
    /// Откуда взяли.
    pub origin: Origin,
    /// Снятый предмет; `None`, пока указатель не сдвинулся.
    pub lifted: Option<Lifted>,
}

/// Сдвиг указателя, после которого нажатие становится перетаскиванием, px.
pub const THRESHOLD: f64 = 5.0;

impl Drag {
    /// Охват формы при текущем повороте (относительно опорной клетки).
    #[must_use]
    pub fn bounds(&self, kit: &Kit) -> Bounds {
        bounds(kit, self.piece, self.orient)
    }

    /// Поворот по часовой; точка захвата поворачивается вместе с предметом.
    pub fn rotate(&mut self) {
        self.orient = self.orient.clockwise();
        self.grab = (1.0 - self.grab.1, self.grab.0);
    }

    /// Левый верхний угол охвата под указателем, px.
    #[must_use]
    pub fn corner(&self, kit: &Kit, pointer: (f64, f64), cell: f64) -> (f64, f64) {
        let b = self.bounds(kit);
        (
            pointer.0 - self.grab.0 * f64::from(b.width()) * cell,
            pointer.1 - self.grab.1 * f64::from(b.height()) * cell,
        )
    }

    /// Куда встанет предмет на поле `field`; `None`, если указатель не над полем.
    #[must_use]
    pub fn target(&self, kit: &Kit, pointer: (f64, f64), field: Rect, cell: f64) -> Option<Placed> {
        if !field.contains(pointer) || cell <= 0.0 {
            return None;
        }
        let (left, top) = self.corner(kit, pointer, cell);
        let col = to_cell((left - field.left) / cell)?;
        let row = to_cell((top - field.top) / cell)?;
        let b = self.bounds(kit);
        Some(Placed {
            piece: self.piece,
            pos: Cell::new(col - b.min.x, HEIGHT - 1 - row - b.max.y),
            orient: self.orient,
        })
    }
}

/// Охват формы предмета `piece` при повороте `orient`.
#[must_use]
pub fn bounds(kit: &Kit, piece: usize, orient: Orientation) -> Bounds {
    let cells = place(&kit.item(piece).shape, Cell::default(), orient);
    Bounds::of(&cells).unwrap_or(Bounds {
        min: Cell::default(),
        max: Cell::default(),
    })
}

/// Ближайшая клетка; `None` для значений вне разумных пределов.
fn to_cell(value: f64) -> Option<i16> {
    let rounded = value.round();
    (rounded.abs() < 100.0).then(|| {
        #[allow(clippy::cast_possible_truncation)] // |rounded| < 100
        let cell = rounded as i16;
        cell
    })
}

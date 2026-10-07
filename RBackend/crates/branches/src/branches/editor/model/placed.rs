//! [`Placed`] — предмет или сумка на поле: что, где и как повёрнуто.

use super::{
    cell::{place, Cell},
    kit::Kit,
    orientation::Orientation,
};

/// Предмет или сумка на поле.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct Placed {
    /// Номер предмета в [`Kit`].
    pub piece: usize,
    /// Куда встала опорная клетка формы.
    pub pos: Cell,
    /// Поворот.
    pub orient: Orientation,
}

impl Placed {
    /// Клетки, которые занимает предмет.
    #[must_use]
    pub fn cells(&self, kit: &Kit) -> Vec<Cell> {
        place(&kit.item(self.piece).shape, self.pos, self.orient)
    }

    /// Где окажется предмет, лежавший в сумке `from`, когда сумку переставят в `to`.
    #[must_use]
    pub fn carried(&self, from: &Self, to: &Self) -> Self {
        let turn = to.orient.since(from.orient);
        Self {
            piece: self.piece,
            pos: to.pos.plus(turn.apply(self.pos.minus(from.pos))),
            orient: self.orient.then(turn),
        }
    }
}

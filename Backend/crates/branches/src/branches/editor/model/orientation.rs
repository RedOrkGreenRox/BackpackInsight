//! [`Orientation`] — поворот предмета, как `orientation` в экспорте игры.

use super::cell::Cell;
use serde::{Deserialize, Serialize};

/// Поворот предмета, как `orientation` в экспорте игры. `Right` — четверть оборота по часовой.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Orientation {
    /// Как на картинке.
    #[default]
    Up,
    /// 90° по часовой.
    Right,
    /// 180°.
    Down,
    /// 90° против часовой.
    Left,
}

impl Orientation {
    /// Число четвертей оборота по часовой от `Up`.
    #[must_use]
    pub const fn turns(self) -> u8 {
        match self {
            Self::Up => 0,
            Self::Right => 1,
            Self::Down => 2,
            Self::Left => 3,
        }
    }

    /// Поворот на `turns` четвертей по часовой от `Up`.
    #[must_use]
    pub const fn from_turns(turns: u8) -> Self {
        match turns % 4 {
            0 => Self::Up,
            1 => Self::Right,
            2 => Self::Down,
            _ => Self::Left,
        }
    }

    /// Следующий поворот по часовой.
    #[must_use]
    pub const fn clockwise(self) -> Self {
        Self::from_turns(self.turns() + 1)
    }

    /// Сначала `self`, потом ещё `other` (повороты складываются).
    #[must_use]
    pub const fn then(self, other: Self) -> Self {
        Self::from_turns(self.turns() + other.turns())
    }

    /// Поворот, который переводит `from` в `self`.
    #[must_use]
    pub const fn since(self, from: Self) -> Self {
        Self::from_turns(self.turns() + 4 - from.turns())
    }

    /// Поворачивает смещение клетки формы. `Right`: `(0, 1)` → `(1, 0)`.
    #[must_use]
    pub const fn apply(self, cell: Cell) -> Cell {
        match self {
            Self::Up => cell,
            Self::Right => Cell::new(cell.y, -cell.x),
            Self::Down => Cell::new(-cell.x, -cell.y),
            Self::Left => Cell::new(-cell.y, cell.x),
        }
    }

    /// Имя в экспорте игры.
    #[must_use]
    pub const fn name(self) -> &'static str {
        match self {
            Self::Up => "Up",
            Self::Right => "Right",
            Self::Down => "Down",
            Self::Left => "Left",
        }
    }

    /// Разбирает имя из экспорта игры.
    #[must_use]
    pub fn parse(name: &str) -> Option<Self> {
        [Self::Up, Self::Right, Self::Down, Self::Left]
            .into_iter()
            .find(|o| o.name().eq_ignore_ascii_case(name))
    }
}

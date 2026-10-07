//! Клетки поля рюкзака, их охват и размещение формы.
//!
//! Система координат как в экспорте игры: `x` растёт вправо, `y` — вверх,
//! поле 9 × 6 клеток (`x` 0..=8, `y` 0..=5). На экране строка сверху = `HEIGHT - 1 - y`.

use super::orientation::Orientation;
use serde::{Deserialize, Serialize};

/// Ширина поля в клетках.
pub const WIDTH: i16 = 9;
/// Высота поля в клетках.
pub const HEIGHT: i16 = 6;

/// Клетка на поле или смещение клетки формы относительно опорной клетки предмета.
#[derive(
    Clone, Copy, Debug, Default, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize,
)]
pub struct Cell {
    /// Столбец, растёт вправо.
    pub x: i16,
    /// Строка, растёт вверх.
    pub y: i16,
}

impl Cell {
    /// Клетка `(x, y)`.
    #[must_use]
    pub const fn new(x: i16, y: i16) -> Self {
        Self { x, y }
    }

    /// Сумма клеток (опорная клетка + смещение).
    #[must_use]
    pub const fn plus(self, other: Self) -> Self {
        Self::new(self.x + other.x, self.y + other.y)
    }

    /// Разность клеток (смещение от `other` до `self`).
    #[must_use]
    pub const fn minus(self, other: Self) -> Self {
        Self::new(self.x - other.x, self.y - other.y)
    }

    /// Лежит ли клетка на поле.
    #[must_use]
    pub const fn on_field(self) -> bool {
        self.x >= 0 && self.x < WIDTH && self.y >= 0 && self.y < HEIGHT
    }
}

/// Прямоугольник, охватывающий клетки (включительно).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Bounds {
    /// Левый нижний угол.
    pub min: Cell,
    /// Правый верхний угол.
    pub max: Cell,
}

impl Bounds {
    /// Охват клеток; `None` для пустого списка.
    #[must_use]
    pub fn of(cells: &[Cell]) -> Option<Self> {
        let first = *cells.first()?;
        Some(cells.iter().fold(
            Self {
                min: first,
                max: first,
            },
            |b, c| Self {
                min: Cell::new(b.min.x.min(c.x), b.min.y.min(c.y)),
                max: Cell::new(b.max.x.max(c.x), b.max.y.max(c.y)),
            },
        ))
    }

    /// Ширина в клетках.
    #[must_use]
    pub const fn width(self) -> i16 {
        self.max.x - self.min.x + 1
    }

    /// Высота в клетках.
    #[must_use]
    pub const fn height(self) -> i16 {
        self.max.y - self.min.y + 1
    }
}

/// Клетки формы `shape`, повёрнутой на `orient` и поставленной опорной клеткой в `pos`.
#[must_use]
pub fn place(shape: &[Cell], pos: Cell, orient: Orientation) -> Vec<Cell> {
    shape.iter().map(|&c| pos.plus(orient.apply(c))).collect()
}

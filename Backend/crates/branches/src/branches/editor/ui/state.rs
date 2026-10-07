//! [`Editor`] — сигналы острова редактора, общие для всех его частей (через контекст).

use super::drag::Drag;
use crate::branches::editor::model::{Board, Kit, Pile, Placed};
use leptos::{html, prelude::*};
use std::sync::Arc;

/// Прямоугольник элемента на экране, px.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Rect {
    /// Левый край.
    pub left: f64,
    /// Верхний край.
    pub top: f64,
    /// Ширина.
    pub width: f64,
    /// Высота.
    pub height: f64,
}

impl Rect {
    /// Лежит ли точка внутри.
    #[must_use]
    pub fn contains(&self, (x, y): (f64, f64)) -> bool {
        x >= self.left
            && x <= self.left + self.width
            && y >= self.top
            && y <= self.top + self.height
    }
}

/// Вид склада.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum StashMode {
    /// Свободная зона: предметы падают и ложатся друг на друга.
    #[default]
    Gravity,
    /// Список в порядке поступления.
    List,
}

/// Куда положить следующий предмет на складе с гравитацией: указатель и точка захвата.
pub type Spawn = ((f64, f64), (f64, f64));

/// Состояние редактора. Копируется дёшево: внутри только сигналы и ссылки на узлы.
#[derive(Clone, Copy)]
pub struct Editor {
    /// Набор предметов; `None`, пока не пришёл ответ сервера.
    pub kit: RwSignal<Option<Arc<Kit>>>,
    /// Поле и склад.
    pub board: RwSignal<Board>,
    /// Герой билда.
    pub hero: RwSignal<Option<String>>,
    /// Что сейчас тащат.
    pub drag: RwSignal<Option<Drag>>,
    /// Указатель, px от левого верхнего угла окна.
    pub pointer: RwSignal<(f64, f64)>,
    /// Предмет под указателем (для звёзд).
    pub hover: RwSignal<Option<Placed>>,
    /// Размер клетки поля, px (меряется при начале перетаскивания).
    pub cell_px: RwSignal<f64>,
    /// Вид склада.
    pub stash: RwSignal<StashMode>,
    /// Тела склада с гравитацией.
    pub pile: RwSignal<Pile>,
    /// Где отпустили предмет над складом (для склада с гравитацией).
    pub spawn: StoredValue<Option<Spawn>>,
    /// Клетка поля, заданная ручкой, px; `None` — по размеру экрана.
    pub field_cell: RwSignal<Option<f64>>,
    /// Высота списка каталога, заданная ручкой, px.
    pub catalog_height: RwSignal<Option<f64>>,
    /// Поле.
    pub field: NodeRef<html::Div>,
    /// Склад.
    pub storage: NodeRef<html::Div>,
    /// Панель каталога.
    pub catalog: NodeRef<html::Div>,
}

impl Editor {
    /// Пустое состояние.
    #[must_use]
    pub fn new(hero: Option<String>) -> Self {
        Self {
            kit: RwSignal::new(None),
            board: RwSignal::new(Board::default()),
            hero: RwSignal::new(hero),
            drag: RwSignal::new(None),
            pointer: RwSignal::new((0.0, 0.0)),
            hover: RwSignal::new(None),
            cell_px: RwSignal::new(0.0),
            stash: RwSignal::new(StashMode::default()),
            pile: RwSignal::new(Pile::default()),
            spawn: StoredValue::new(None),
            field_cell: RwSignal::new(None),
            catalog_height: RwSignal::new(None),
            field: NodeRef::new(),
            storage: NodeRef::new(),
            catalog: NodeRef::new(),
        }
    }

    /// Состояние из контекста острова.
    #[must_use]
    pub fn get() -> Self {
        expect_context::<Self>()
    }

    /// Набор без подписки на изменения.
    #[must_use]
    pub fn kit_now(&self) -> Option<Arc<Kit>> {
        self.kit.get_untracked()
    }

    /// Меняет поле, если набор уже загружен.
    pub fn edit(&self, change: impl FnOnce(&Kit, &mut Board)) {
        if let Some(kit) = self.kit_now() {
            self.board.update(|board| change(&kit, board));
        }
    }
}

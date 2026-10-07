//! [`Editor`] — сигналы острова редактора, общие для всех его частей (через контекст).

use super::drag::Drag;
use crate::branches::editor::model::{Board, Kit, Placed};
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

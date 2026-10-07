//! [`Board`] — состояние редактора: сумки и предметы на поле, склад, режим сумок.
//!
//! Правила как в игре: сумки открывают клетки, предметы стоят только на клетках
//! сумок, а то, на что поставили новый предмет или сумку, падает на склад.

use super::{cell::Cell, kit::Kit, placed::Placed};
use std::collections::HashSet;

/// Сумки, предметы и склад.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Board {
    /// Сумки на поле.
    pub bags: Vec<Placed>,
    /// Предметы на поле.
    pub items: Vec<Placed>,
    /// Склад: номера предметов в порядке поступления.
    pub storage: Vec<usize>,
    /// Режим сумок: предметы замирают, сумки можно двигать под ними.
    pub bag_mode: bool,
}

impl Board {
    /// Клетки, открытые сумками.
    #[must_use]
    pub fn bag_cells(&self, kit: &Kit) -> HashSet<Cell> {
        self.bags.iter().flat_map(|bag| bag.cells(kit)).collect()
    }

    /// Можно ли поставить сюда предмет или сумку `placed` (сам он уже снят с поля).
    #[must_use]
    pub fn fits(&self, kit: &Kit, placed: &Placed) -> bool {
        let cells = placed.cells(kit);
        if !cells.iter().all(|c| c.on_field()) {
            return false;
        }
        if kit.item(placed.piece).is_bag() {
            return true;
        }
        let open = self.bag_cells(kit);
        !self.bag_mode && cells.iter().all(|c| open.contains(c))
    }

    /// Снимает предмет с поля.
    pub fn lift_item(&mut self, index: usize) -> Option<Placed> {
        (index < self.items.len()).then(|| self.items.remove(index))
    }

    /// Снимает сумку. Вне режима сумок вместе с ней снимаются предметы, целиком лежащие в ней.
    pub fn lift_bag(&mut self, kit: &Kit, index: usize) -> Option<(Placed, Vec<Placed>)> {
        if index >= self.bags.len() {
            return None;
        }
        let bag = self.bags.remove(index);
        if self.bag_mode {
            return Some((bag, Vec::new()));
        }
        let inside: HashSet<Cell> = bag.cells(kit).into_iter().collect();
        let (carried, rest): (Vec<Placed>, Vec<Placed>) = std::mem::take(&mut self.items)
            .into_iter()
            .partition(|item| item.cells(kit).iter().all(|c| inside.contains(c)));
        self.items = rest;
        Some((bag, carried))
    }

    /// Ставит предмет (проверка — [`Board::fits`]); предметы под ним падают на склад.
    pub fn drop_item(&mut self, kit: &Kit, placed: Placed) {
        let cells: HashSet<Cell> = placed.cells(kit).into_iter().collect();
        let (hit, keep): (Vec<Placed>, Vec<Placed>) = std::mem::take(&mut self.items)
            .into_iter()
            .partition(|item| item.cells(kit).iter().any(|c| cells.contains(c)));
        self.items = keep;
        self.storage.extend(hit.iter().map(|item| item.piece));
        self.items.push(placed);
    }

    /// Ставит сумку с перенесёнными предметами `carried` (уже на новых местах).
    /// Сумки под ней падают на склад; вне режима сумок за ними падают и предметы без опоры.
    pub fn drop_bag(&mut self, kit: &Kit, placed: Placed, carried: Vec<Placed>) {
        let cells: HashSet<Cell> = placed.cells(kit).into_iter().collect();
        let (hit, keep): (Vec<Placed>, Vec<Placed>) = std::mem::take(&mut self.bags)
            .into_iter()
            .partition(|bag| bag.cells(kit).iter().any(|c| cells.contains(c)));
        self.bags = keep;
        self.storage.extend(hit.iter().map(|bag| bag.piece));
        self.bags.push(placed);
        for item in carried {
            self.put(kit, item);
        }
        if !self.bag_mode {
            self.settle(kit);
        }
    }

    /// Ставит предмет или сумку, если можно, иначе кладёт на склад. Возвращает, встал ли он на поле.
    pub fn put(&mut self, kit: &Kit, placed: Placed) -> bool {
        let fits = self.fits(kit, &placed);
        match (fits, kit.item(placed.piece).is_bag()) {
            (false, _) => self.storage.push(placed.piece),
            (true, true) => self.drop_bag(kit, placed, Vec::new()),
            (true, false) => self.drop_item(kit, placed),
        }
        fits
    }

    /// Предметы, которые не лежат целиком на сумках, падают на склад.
    pub fn settle(&mut self, kit: &Kit) {
        let open = self.bag_cells(kit);
        let (keep, fall): (Vec<Placed>, Vec<Placed>) = std::mem::take(&mut self.items)
            .into_iter()
            .partition(|item| item.cells(kit).iter().all(|c| open.contains(c)));
        self.items = keep;
        self.storage.extend(fall.iter().map(|item| item.piece));
    }

    /// Включает или выключает режим сумок; при выключении предметы без опоры падают на склад.
    pub fn set_bag_mode(&mut self, kit: &Kit, on: bool) {
        self.bag_mode = on;
        if !on {
            self.settle(kit);
        }
    }

    /// Сброс: в режиме сумок на склад уходят сумки, иначе — предметы.
    pub fn reset(&mut self) {
        let fallen = if self.bag_mode {
            std::mem::take(&mut self.bags)
        } else {
            std::mem::take(&mut self.items)
        };
        self.storage
            .extend(fallen.iter().map(|placed| placed.piece));
    }

    /// Забирает предмет со склада.
    pub fn take_stored(&mut self, index: usize) -> Option<usize> {
        (index < self.storage.len()).then(|| self.storage.remove(index))
    }
}

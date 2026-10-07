//! [`BuildFile`] — билд в формате экспорта из игры, только то, что относится к билду.
//!
//! Игра пишет ещё `run`, уровень героя и имя предмета; при чтении они
//! пропускаются, при записи не выводятся.

use super::{board::Board, cell::Cell, kit::Kit, orientation::Orientation, placed::Placed};
use serde::{Deserialize, Serialize};

/// Файл билда.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildFile {
    /// Версия игры.
    #[serde(default)]
    pub game_version: String,
    /// Герой.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub hero: Option<HeroRef>,
    /// Сумки и предметы на поле.
    #[serde(default)]
    pub inventory_items: Vec<FileItem>,
    /// Предметы на складе.
    #[serde(default)]
    pub storage_items: Vec<FileItem>,
}

/// Герой билда.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct HeroRef {
    /// Имя героя, как в экспорте (`Mycella`).
    pub name: String,
}

/// Предмет в файле.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileItem {
    /// `id` предмета.
    pub id: String,
    /// Опорная клетка на поле; у предметов склада её нет.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub position: Option<Cell>,
    /// Поворот (`Up`, `Right`, `Down`, `Left`).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub orientation: Option<String>,
    /// Занятые клетки; при чтении не нужны, их задают форма, позиция и поворот.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub slot_positions: Vec<Cell>,
}

/// Что получилось при чтении файла.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Imported {
    /// Поле и склад.
    pub board: Board,
    /// Герой из файла.
    pub hero: Option<String>,
    /// `id`, которых нет в наборе предметов этой версии.
    pub unknown: Vec<String>,
}

impl BuildFile {
    /// Файл из состояния редактора.
    #[must_use]
    pub fn export(kit: &Kit, board: &Board, hero: Option<&str>) -> Self {
        let placed = |p: &Placed| FileItem {
            id: kit.item(p.piece).id.clone(),
            position: Some(p.pos),
            orientation: Some(p.orient.name().to_owned()),
            slot_positions: p.cells(kit),
        };
        let stored = |&piece: &usize| FileItem {
            id: kit.item(piece).id.clone(),
            ..FileItem::default()
        };
        Self {
            game_version: kit.version.clone(),
            hero: hero.map(|name| HeroRef {
                name: name.to_owned(),
            }),
            inventory_items: board.bags.iter().chain(&board.items).map(placed).collect(),
            storage_items: board.storage.iter().map(stored).collect(),
        }
    }

    /// Раскладывает файл по правилам поля: сначала сумки, потом предметы;
    /// то, что не встаёт, уходит на склад.
    #[must_use]
    pub fn import(&self, kit: &Kit) -> Imported {
        let mut out = Imported {
            hero: self.hero.as_ref().map(|hero| hero.name.clone()),
            ..Imported::default()
        };
        let mut items = Vec::new();
        for entry in &self.inventory_items {
            let Some(piece) = kit.by_id(&entry.id) else {
                out.unknown.push(entry.id.clone());
                continue;
            };
            let orient = entry.orientation.as_deref().and_then(Orientation::parse);
            match (entry.position, orient) {
                (Some(pos), Some(orient)) => {
                    let placed = Placed { piece, pos, orient };
                    if kit.item(piece).is_bag() {
                        out.board.put(kit, placed);
                    } else {
                        items.push(placed);
                    }
                }
                _ => out.board.storage.push(piece),
            }
        }
        for placed in items {
            out.board.put(kit, placed);
        }
        for entry in &self.storage_items {
            match kit.by_id(&entry.id) {
                Some(piece) => out.board.storage.push(piece),
                None => out.unknown.push(entry.id.clone()),
            }
        }
        out
    }
}

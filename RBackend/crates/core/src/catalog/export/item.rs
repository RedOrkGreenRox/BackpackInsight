//! [`ItemDef`] — один предмет экспорта игры в строгом виде.

use super::parts::{Cell, CombatStats, Levels, Recipe};
use crate::ItemRarity;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// Предмет так, как его описывает экспорт игры (`items_{lang}_X_Y_Z.json`).
///
/// Незнакомое поле или значение — ошибка разбора: формат экспорта
/// меняется только вместе с этой структурой.
#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ItemDef {
    /// Английское имя, общее для всех языков; ключ предмета.
    pub id: String,
    /// Имя на языке экспорта (у предметов всегда английское).
    pub name: String,
    /// Редкость.
    #[serde(with = "super::rarity")]
    pub rarity: ItemRarity,
    /// Цена в монетах.
    pub coin_value: u32,
    /// Типы и теги (`Armor`, `Food`, `Stealable_Grabber`, …).
    pub item_types: Vec<String>,
    /// Герой предмета; `Shared` — общий для всех.
    pub connected_hero: String,
    /// Откуда открывается (`Default`, `HeroLevel`, `Area`, …).
    pub unlock_source: String,
    /// Клетки, которые предмет занимает в рюкзаке.
    pub item_shape: Vec<Cell>,
    /// Клетки-звёзды вокруг предмета.
    pub item_stars: Vec<Cell>,
    /// Продаётся ли в магазине.
    pub purchasable: bool,
    /// Скрыт ли предмет до выхода обновления.
    pub embargoed: bool,
    /// Метка обновления у скрытого предмета (с 7.0.0, например `Season7`).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub embargo_code: Option<String>,
    /// Рецепты.
    pub recipes: Vec<Recipe>,
    /// Боевые характеристики.
    pub combat_stats: CombatStats,
    /// Тексты способностей на языке экспорта.
    pub tooltips: Vec<String>,
    /// Эффект поглощения у поглощаемых предметов (с 7.0.0).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub absorb_effect: Option<Vec<String>>,
    /// Все числовые характеристики по имени.
    pub all_stats: BTreeMap<String, f64>,
    /// Прокачка по уровням.
    pub levels: Levels,
}

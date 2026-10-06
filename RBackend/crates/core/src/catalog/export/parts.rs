//! Части предмета из экспорта игры: клетки формы, рецепты, боевые статы, уровни.

use serde::{Deserialize, Serialize};

/// Клетка на сетке рюкзака относительно левого верхнего угла предмета.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct Cell {
    /// Столбец (бывает отрицательным у звёзд слева от предмета).
    pub x: i8,
    /// Строка (бывает отрицательной у звёзд над предметом).
    pub y: i8,
}

/// Рецепт: из каких предметов собирается `result_id`.
#[derive(Clone, Debug, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Recipe {
    /// `id` получаемого предмета.
    pub result_id: String,
    /// `id` ингредиентов.
    pub ingredient_ids: Vec<String>,
}

/// Боевые характеристики; `None` — у предмета такой характеристики нет.
#[derive(Clone, Copy, Debug, Default, PartialEq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CombatStats {
    /// Минимальный урон.
    pub damage_min: Option<f64>,
    /// Максимальный урон.
    pub damage_max: Option<f64>,
    /// Точность.
    pub accuracy: Option<f64>,
    /// Расход выносливости.
    pub stamina_cost: Option<f64>,
    /// Перезарядка в секундах.
    pub cooldown: Option<f64>,
    /// Шанс крита.
    pub critical_chance: Option<f64>,
    /// Множитель крита.
    pub critical_damage: Option<f64>,
}

/// Прокачка предмета по уровням.
#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Levels {
    /// Максимальный уровень.
    pub max_level: u8,
    /// Прирост шанса за уровень.
    pub chance_per_level: Option<f64>,
    /// Базовый шанс.
    pub base_chance: Option<f64>,
    /// Бонус шанса на пороговых уровнях.
    pub chance_breakpoint_bonus: Option<f64>,
    /// Описание способности с подставленными значениями первого уровня.
    pub ability_description: Option<String>,
    /// Что меняется на каждом уровне.
    pub changes: Vec<LevelChange>,
}

/// Изменение характеристики на одном уровне.
#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct LevelChange {
    /// Уровень, на котором срабатывает изменение.
    pub level: u8,
    /// Имя характеристики (`Damage`, `CriticalChance`, …).
    pub stat: String,
    /// Прибавка.
    pub value: f64,
    /// Вид изменения; в экспорте 5.1.0 всегда пуст.
    #[serde(rename = "type")]
    pub kind: Option<String>,
}

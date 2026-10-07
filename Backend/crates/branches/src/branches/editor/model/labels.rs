//! [`EditorLabels`] — переведённые подписи острова редактора.

use serde::{Deserialize, Serialize};

/// Подписи на языке страницы; ключи словаря — `editor_<поле>`.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct EditorLabels {
    /// Заголовок панели каталога.
    pub catalog: String,
    /// Плейсхолдер поиска.
    pub search: String,
    /// Подпись выбора героя.
    pub hero: String,
    /// «Все герои».
    pub hero_all: String,
    /// Подпись выбора вида.
    pub kind: String,
    /// «Всё».
    pub kind_all: String,
    /// «Сумки».
    pub kind_bags: String,
    /// «Предметы».
    pub kind_items: String,
    /// Подпись выбора редкости.
    pub rarity: String,
    /// «Любая редкость».
    pub rarity_all: String,
    /// Подпись сортировки.
    pub sort: String,
    /// «По редкости».
    pub sort_rarity: String,
    /// «По имени».
    pub sort_name: String,
    /// «По цене».
    pub sort_price: String,
    /// «Показать ещё».
    pub more: String,
    /// Имя поля для экранных дикторов.
    pub inventory: String,
    /// Имя склада для экранных дикторов.
    pub storage: String,
    /// Кнопка «склад списком».
    pub stash_list: String,
    /// Кнопка «склад с гравитацией».
    pub stash_gravity: String,
    /// Кнопка подсказки «i».
    pub info: String,
    /// Подсказка ручки размера.
    pub resize: String,
    /// Кнопка режима сумок.
    pub bag_mode: String,
    /// Кнопка сброса.
    pub reset: String,
    /// Кнопка импорта.
    pub import: String,
    /// Кнопка экспорта.
    pub export: String,
    /// «Применить» в окне импорта.
    pub apply: String,
    /// «Закрыть».
    pub close: String,
    /// «Скачать .json».
    pub download: String,
    /// Подсказка к окну импорта.
    pub import_hint: String,
    /// Ошибка разбора файла.
    pub import_error: String,
    /// Неизвестные предметы, `{0}` — их список.
    pub unknown: String,
    /// «Загрузка…».
    pub loading: String,
    /// Подсказка по управлению.
    pub hint: String,
}

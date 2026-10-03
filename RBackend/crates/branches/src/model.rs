//! Общие типы данных между сервером и островами.
//!
//! Всё здесь сериализуется: острова получают эти структуры как пропсы
//! (JSON в HTML) и как ответы серверных функций.

use serde::{Deserialize, Serialize};

/// Сколько карточек каталога отдаётся за одну порцию.
pub const PAGE_SIZE: usize = 48;

/// Сколько первых карточек грузят картинку сразу (остальные — лениво).
pub const EAGER_IMAGES: usize = 12;

/// Язык интерфейса и каталога.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Lang {
    /// Английский (язык по умолчанию).
    #[default]
    En,
    /// Русский.
    Ru,
}

impl Lang {
    /// Все поддерживаемые языки.
    pub const ALL: [Lang; 2] = [Lang::En, Lang::Ru];

    /// Код языка для URL, cookie и атрибута `lang`.
    #[must_use]
    pub fn code(self) -> &'static str {
        match self {
            Lang::En => "en",
            Lang::Ru => "ru",
        }
    }

    /// Язык, на который переключает кнопка смены языка (их два).
    #[must_use]
    pub fn other(self) -> Self {
        match self {
            Lang::En => Lang::Ru,
            Lang::Ru => Lang::En,
        }
    }

    /// Разбирает код языка (`en`, `ru`, `ru-RU`, …).
    #[must_use]
    pub fn parse(code: &str) -> Option<Self> {
        let base = code.trim().split(['-', '_']).next()?.to_ascii_lowercase();
        match base.as_str() {
            "en" => Some(Lang::En),
            "ru" => Some(Lang::Ru),
            _ => None,
        }
    }
}

/// Карточка предмета в сетке каталога.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ItemCard {
    /// Слаг для URL (`/item/{slug}`).
    pub slug: String,
    /// Отображаемое имя.
    pub name: String,
    /// Редкость (`Common`, `Rare`, …) — задаёт цвет подписи.
    pub rarity: String,
    /// Ключ картинки из `ItemIconService` (без формата и расширения).
    pub image: String,
}

/// Порция результатов поиска по каталогу.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct ItemsPage {
    /// Карточки этой порции.
    pub cards: Vec<ItemCard>,
    /// Сколько всего предметов подходит под запрос.
    pub total: usize,
    /// Номер последней отданной порции (с нуля).
    pub page: usize,
    /// Есть ли ещё порции после этой.
    pub has_more: bool,
}

/// Переведённые подписи острова каталога: острову не нужен словарь целиком.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct ItemsLabels {
    /// Заголовок страницы.
    pub title: String,
    /// Подзаголовок под заголовком.
    pub subtitle: String,
    /// Плейсхолдер поля поиска.
    pub placeholder: String,
    /// Текст «ничего не найдено».
    pub empty: String,
    /// Шаблон счётчика для экранного диктора, `{0}` заменяется числом.
    pub found: String,
}

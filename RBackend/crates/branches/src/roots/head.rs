//! `PageHead` — заголовок и описание страницы для `<head>`.
//!
//! Ветки не ставят теги `<head>` сами: их рисует [`super::App`], всегда одним и тем же
//! набором и в одном порядке. Это требование islands router: при переходе он сравнивает
//! старый и новый документ узел за узлом, и лишний тег на одной из страниц сдвигал
//! сравнение так, что пропадал весь `<body>`.

use leptos::prelude::*;
use leptos_meta::{Meta, Title};

/// Имя сайта в заголовках вкладки.
const SITE: &str = "Backpack Insight";

/// Что ветка сообщает о себе в `<head>`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PageHead {
    /// Полный текст `<title>`.
    pub title: String,
    /// `<meta name="description">`.
    pub description: String,
}

impl PageHead {
    /// Заголовок вида «Раздел | Backpack Insight».
    #[must_use]
    pub fn section(name: &str, description: String) -> Self {
        Self {
            title: format!("{name} | {SITE}"),
            description,
        }
    }

    /// Заголовок — просто имя сайта (главная).
    #[must_use]
    pub fn site(description: String) -> Self {
        Self {
            title: SITE.to_owned(),
            description,
        }
    }

    /// Теги `<head>`. `indexable` — страница в sitemap, остальные закрыты от индексации.
    #[must_use]
    pub fn tags(self, indexable: bool) -> impl IntoView {
        let robots = if indexable {
            "index, follow"
        } else {
            "noindex"
        };
        view! {
            <Title text=self.title/>
            <Meta name="description" content=self.description/>
            <Meta name="robots" content=robots/>
        }
    }
}

#[cfg(test)]
mod tests {
    use super::PageHead;

    #[test]
    fn section_titles_carry_site_name() {
        let head = PageHead::section("Items", String::new());
        assert_eq!(head.title, "Items | Backpack Insight");
        assert_eq!(PageHead::site(String::new()).title, "Backpack Insight");
    }
}

//! Карточка предмета в сетке каталога. Используется и при SSR, и островом.
//!
//! Разметка и классы — как у TS-версии (`ItemsLayoutRenderer`), чтобы работали
//! перенесённые стили `style/roots/_roots/items`.

use crate::model::{ItemCard, ItemImage};
use leptos::prelude::*;

/// Заглушка, если у предмета нет своей картинки (ключ пустой): `{PLACEHOLDER}.{avif,webp}`.
/// Лежит плоско, без папок по формату, в отличие от картинок предметов.
const PLACEHOLDER: &str = "/images/placeholder/placeholder";
/// Шаг задержки появления соседних карточек, как в TS-версии (мс).
const STAGGER_MS: usize = 30;
/// После скольких карточек задержка перестаёт расти.
const STAGGER_LIMIT: usize = 12;

/// Карточка: картинка (`avif` с запасным `webp`, 1x/2x), имя и редкость.
/// `index` — место в выдаче: первые карточки грузят картинку сразу и появляются по очереди.
#[component]
#[allow(clippy::must_use_candidate)]
pub fn ItemCardView(card: ItemCard, index: usize, eager: bool) -> impl IntoView {
    let missing = card.image.is_empty();
    let [avif, webp] = ["avif", "webp"].map(|format| srcset(&card.image, format));
    let src = image_url(&card.image.x1, "webp");
    let rarity_class = format!("rarity-{}", card.rarity.to_lowercase());
    let delay = format!("--fade-delay: {}ms", (index % STAGGER_LIMIT) * STAGGER_MS);
    view! {
        <div class="item-card-link" style=delay data-slug=card.slug>
            <div class="item-card">
                <div class="item-image-wrapper" class:no-image=missing>
                    <picture>
                        <source srcset=avif r#type="image/avif"/>
                        <img
                            src=src
                            srcset=webp
                            alt=card.name.clone()
                            class="item-icon"
                            loading=if eager { "eager" } else { "lazy" }
                            fetchpriority=if eager { "high" } else { "auto" }
                            decoding="async"
                        />
                    </picture>
                </div>
                <span class="item-name">{card.name}</span>
                <div class="item-stats">
                    <span class=rarity_class>{card.rarity}</span>
                </div>
            </div>
        </div>
    }
}

/// `srcset`: клетка 60 px для обычных экранов, 120 px для 2x; у заглушки — один адрес.
fn srcset(image: &ItemImage, format: &str) -> String {
    if image.is_empty() {
        image_url("", format)
    } else {
        format!(
            "{} 1x, {} 2x",
            image_url(&image.x1, format),
            image_url(&image.x2, format)
        )
    }
}

/// Адрес картинки (`art/60/slug.hash` из манифеста) в формате `format` или заглушки, если путь пустой.
fn image_url(image: &str, format: &str) -> String {
    if image.is_empty() {
        format!("{PLACEHOLDER}.{format}")
    } else {
        format!("/images/{image}.{format}")
    }
}

#[cfg(test)]
mod tests {
    use super::{image_url, srcset};
    use crate::model::ItemImage;

    #[test]
    fn item_and_placeholder_urls() {
        assert_eq!(
            image_url("art/60/leviathan.ab12", "avif"),
            "/images/art/60/leviathan.ab12.avif"
        );
        assert_eq!(
            image_url("", "avif"),
            "/images/placeholder/placeholder.avif"
        );
        assert_eq!(
            image_url("", "webp"),
            "/images/placeholder/placeholder.webp"
        );
    }

    #[test]
    fn srcset_has_both_densities() {
        let image = ItemImage {
            x1: "art/60/a.1".to_owned(),
            x2: "art/120/a.2".to_owned(),
        };
        assert_eq!(
            srcset(&image, "webp"),
            "/images/art/60/a.1.webp 1x, /images/art/120/a.2.webp 2x"
        );
        assert_eq!(
            srcset(&ItemImage::default(), "avif"),
            "/images/placeholder/placeholder.avif"
        );
    }
}

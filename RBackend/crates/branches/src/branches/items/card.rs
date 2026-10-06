//! Карточка предмета в сетке каталога. Используется и при SSR, и островом.
//!
//! Разметка и классы — как у TS-версии (`ItemsLayoutRenderer`), чтобы работали
//! перенесённые стили `style/roots/_roots/items`.

use crate::model::ItemCard;
use leptos::prelude::*;

/// Заглушка, если у предмета нет своей картинки (ключ пустой): `{PLACEHOLDER}.{avif,webp}`.
/// Лежит плоско, без папок по формату, в отличие от картинок предметов.
const PLACEHOLDER: &str = "/images/placeholder/placeholder";
/// Шаг задержки появления соседних карточек, как в TS-версии (мс).
const STAGGER_MS: usize = 30;
/// После скольких карточек задержка перестаёт расти.
const STAGGER_LIMIT: usize = 12;

/// Карточка: картинка (`avif` с запасным `webp`), имя и редкость.
/// `index` — место в выдаче: первые карточки грузят картинку сразу и появляются по очереди.
#[component]
#[allow(clippy::must_use_candidate)]
pub fn ItemCardView(card: ItemCard, index: usize, eager: bool) -> impl IntoView {
    let missing = card.image.is_empty();
    let [avif, webp] = ["avif", "webp"].map(|format| image_url(&card.image, format));
    let rarity_class = format!("rarity-{}", card.rarity.to_lowercase());
    let delay = format!("--fade-delay: {}ms", (index % STAGGER_LIMIT) * STAGGER_MS);
    view! {
        <div class="item-card-link" style=delay data-slug=card.slug>
            <div class="item-card">
                <div class="item-image-wrapper" class:no-image=missing>
                    <picture>
                        <source srcset=avif r#type="image/avif"/>
                        <img
                            src=webp
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

/// Адрес картинки предмета в формате `format` или заглушки, если ключ пустой.
fn image_url(image: &str, format: &str) -> String {
    if image.is_empty() {
        format!("{PLACEHOLDER}.{format}")
    } else {
        format!("/images/items/{format}/{image}.{format}")
    }
}

#[cfg(test)]
mod tests {
    use super::image_url;

    #[test]
    fn item_and_placeholder_urls() {
        assert_eq!(
            image_url("leviathan", "avif"),
            "/images/items/avif/leviathan.avif"
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
}

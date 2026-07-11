use crate::{ItemName, SlugService};
use std::fmt;

/// Доменный тип ключа картинки предмета.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct ImageKey(String);

impl ImageKey {
    pub fn new_unchecked(value: impl Into<String>) -> Self {
        Self(value.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for ImageKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

/// Единый сервис выбора картинки предмета.
///
/// Поведение повторяет текущую связку:
///
/// - `Frontend/Web/ground/utils/ItemIconService.ts`;
/// - `Frontend/Web/scripts/verify-item-images.js`.
pub struct ItemIconService;

impl ItemIconService {
    pub fn image_key(
        name: impl Into<ItemName>,
        rarity: Option<&str>,
        first_tooltip: Option<&str>,
    ) -> ImageKey {
        let name = name.into();

        if let Some(masked) = masked_item_key(name.as_str()) {
            return ImageKey::new_unchecked(masked);
        }

        if rarity == Some("Special") {
            if let Some(number) = heist_plan_step(first_tooltip.unwrap_or_default()) {
                return ImageKey::new_unchecked(format!("heist-plan-{number}"));
            }
        }

        ImageKey::new_unchecked(SlugService::to_slug(name).to_string())
    }
}

fn masked_item_key(name: &str) -> Option<&'static str> {
    match name {
        "Suspicious Sausage" => Some("tender-sausage"),
        "Fools Gold" => Some("gold-ore"),
        "Feral Cat" => Some("black-cat"),
        "Cursed Dagger" => Some("poison-dagger"),
        "Book of Dark Secrets" => Some("dusty-book"),
        "Blind Fury Potion" => Some("wrath-potion"),
        "Feather of Icarus" => Some("phoenix-feather"),
        _ => None,
    }
}

fn heist_plan_step(tooltip: &str) -> Option<u32> {
    let tooltip = tooltip.trim_start();
    let rest = tooltip.get(..4)?;
    if !rest.eq_ignore_ascii_case("Step") {
        return None;
    }

    let after_step = tooltip.get(4..)?.trim_start();
    if after_step.is_empty() {
        return None;
    }

    let token = after_step
        .split(|ch: char| !ch.is_ascii_alphanumeric())
        .next()
        .unwrap_or_default();

    if token.is_empty() {
        return None;
    }

    token
        .parse::<u32>()
        .ok()
        .or_else(|| SlugService::roman_to_arabic(token))
}

#[cfg(test)]
mod tests {
    use super::ItemIconService;

    #[test]
    fn masked_items_match_current_frontend_mapping() {
        let cases = [
            ("Suspicious Sausage", "tender-sausage"),
            ("Fools Gold", "gold-ore"),
            ("Feral Cat", "black-cat"),
            ("Cursed Dagger", "poison-dagger"),
            ("Book of Dark Secrets", "dusty-book"),
            ("Blind Fury Potion", "wrath-potion"),
            ("Feather of Icarus", "phoenix-feather"),
        ];

        for (name, expected) in cases {
            assert_eq!(
                ItemIconService::image_key(name, None, None).as_str(),
                expected
            );
        }
    }

    #[test]
    fn special_heist_plan_uses_step_number_from_tooltip() {
        assert_eq!(
            ItemIconService::image_key("Any Plan", Some("Special"), Some("Step 4: Do things"))
                .as_str(),
            "heist-plan-4"
        );
        assert_eq!(
            ItemIconService::image_key("Any Plan", Some("Special"), Some("Step IV: Do things"))
                .as_str(),
            "heist-plan-4"
        );
    }

    #[test]
    fn default_image_key_is_slug() {
        assert_eq!(
            ItemIconService::image_key("Robo Rat 2.0", Some("Rare"), None).as_str(),
            "robo-rat-2-0"
        );
    }
}

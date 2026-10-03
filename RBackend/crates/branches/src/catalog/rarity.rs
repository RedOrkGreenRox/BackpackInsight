//! Порядок редкостей для сортировки каталога (как `RARITY_WEIGHTS` в TS-версии).

/// Редкости от самой ценной к самой простой.
const ORDER: [&str; 9] = [
    "Unique",
    "Mythic",
    "Legendary",
    "Epic",
    "Rare",
    "Common",
    "Boon",
    "Relic",
    "Special",
];

/// Место редкости в порядке «от ценной к простой»; неизвестные редкости — в конце.
#[must_use]
pub fn rank(rarity: &str) -> usize {
    ORDER
        .iter()
        .position(|known| *known == rarity)
        .unwrap_or(ORDER.len())
}

#[cfg(test)]
mod tests {
    use super::rank;

    #[test]
    fn unique_first_unknown_last() {
        assert!(rank("Unique") < rank("Mythic"));
        assert!(rank("Common") < rank("Special"));
        assert_eq!(rank("???"), 9);
    }
}

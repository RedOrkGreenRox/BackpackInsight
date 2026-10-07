//! (Де)сериализация [`ItemRarity`] строкой, как она записана в экспорте игры.

use crate::ItemRarity;
use serde::{de::Error, Deserialize, Deserializer, Serializer};

/// Читает редкость; незнакомое имя — ошибка разбора, а не «прочее».
///
/// # Errors
/// Значение не строка или не одна из известных редкостей.
pub fn deserialize<'de, D: Deserializer<'de>>(deserializer: D) -> Result<ItemRarity, D::Error> {
    let name = <&str>::deserialize(deserializer)?;
    name.parse().map_err(D::Error::custom)
}

/// Пишет редкость её именем из экспорта.
///
/// # Errors
/// Только ошибки самого сериализатора.
#[allow(clippy::trivially_copy_pass_by_ref)] // сигнатура задана `#[serde(with)]`
pub fn serialize<S: Serializer>(rarity: &ItemRarity, serializer: S) -> Result<S::Ok, S::Error> {
    serializer.serialize_str(rarity.as_str())
}

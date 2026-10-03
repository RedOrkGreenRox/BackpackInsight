//! Чтение полей из обобщённого дерева значений FlatBuffers-пака (`pack::PackValue`).
//!
//! Пак `api_items` хранит предмет как JSON-подобное дерево; здесь — маленькие
//! типобезопасные геттеры, чтобы [`super::item`] собирал `CatalogItem` без `match` на каждом поле.

use pack::PackValue;
use std::collections::BTreeMap;

/// Объект пака: ключ → значение.
pub type Object = BTreeMap<String, PackValue>;

/// Значение как объект.
pub fn object(value: &PackValue) -> Option<&Object> {
    match value {
        PackValue::Object(object) => Some(object),
        _ => None,
    }
}

/// Строковое поле.
pub fn string(object: &Object, key: &str) -> Option<String> {
    match object.get(key) {
        Some(PackValue::String(value)) => Some(value.clone()),
        _ => None,
    }
}

/// Целое поле.
pub fn int(object: &Object, key: &str) -> Option<i64> {
    match object.get(key) {
        Some(PackValue::Int(value)) => Some(*value),
        _ => None,
    }
}

/// Логическое поле.
pub fn boolean(object: &Object, key: &str) -> Option<bool> {
    match object.get(key) {
        Some(PackValue::Bool(value)) => Some(*value),
        _ => None,
    }
}

/// Массив строк; нестроковые элементы пропускаются.
pub fn strings(object: &Object, key: &str) -> Vec<String> {
    array(object, key)
        .iter()
        .filter_map(|value| match value {
            PackValue::String(value) => Some(value.clone()),
            _ => None,
        })
        .collect()
}

/// Массив значений (пустой, если поля нет или это не массив).
pub fn array<'a>(object: &'a Object, key: &str) -> &'a [PackValue] {
    match object.get(key) {
        Some(PackValue::Array(values)) => values,
        _ => &[],
    }
}

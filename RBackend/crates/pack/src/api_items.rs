use crate::generated::api_items_generated::backpack_insight::api_items::{
    api_items_pack_buffer_has_identifier, root_as_api_items_pack, Value as FbValue, ValueKind,
};
use std::{collections::BTreeMap, fs, path::Path};

#[derive(Debug, Clone, PartialEq)]
pub enum PackValue {
    Null,
    Bool(bool),
    Int(i64),
    Float(f64),
    String(String),
    Array(Vec<PackValue>),
    Object(BTreeMap<String, PackValue>),
}

#[derive(Debug, Clone, PartialEq)]
pub struct ApiItemEntry {
    pub item_id: String,
    pub value: PackValue,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ApiItemsPackInfo {
    pub schema_version: String,
    pub lang: String,
    pub items: Vec<ApiItemEntry>,
}

pub fn read_api_items(path: &Path) -> Result<ApiItemsPackInfo, String> {
    let bytes =
        fs::read(path).map_err(|err| format!("could not read {}: {err}", path.display()))?;
    read_api_items_bytes(&bytes)
}

pub fn read_api_items_bytes(bytes: &[u8]) -> Result<ApiItemsPackInfo, String> {
    if !api_items_pack_buffer_has_identifier(bytes) {
        return Err("api items FlatBuffer has wrong identifier".to_string());
    }

    let pack = root_as_api_items_pack(bytes).map_err(|err| err.to_string())?;
    let items = pack
        .items()
        .iter()
        .map(|item| ApiItemEntry {
            item_id: item.item_id().to_string(),
            value: fb_value_to_pack_value(item.value()),
        })
        .collect::<Vec<_>>();

    Ok(ApiItemsPackInfo {
        schema_version: pack.schema_version().to_string(),
        lang: pack.lang().to_string(),
        items,
    })
}

fn fb_value_to_pack_value(value: FbValue<'_>) -> PackValue {
    match value.kind() {
        ValueKind::Null => PackValue::Null,
        ValueKind::Bool => PackValue::Bool(value.bool_value()),
        ValueKind::Int => PackValue::Int(value.int_value()),
        ValueKind::Float => PackValue::Float(value.float_value()),
        ValueKind::String => value
            .string_value()
            .map(|s| PackValue::String(s.to_string()))
            .unwrap_or(PackValue::Null),
        ValueKind::Array => PackValue::Array(
            value
                .array_value()
                .map(|items| items.iter().map(fb_value_to_pack_value).collect())
                .unwrap_or_default(),
        ),
        ValueKind::Object => {
            let mut object = BTreeMap::new();
            if let Some(items) = value.object_value() {
                for item in items {
                    object.insert(item.key().to_string(), fb_value_to_pack_value(item.value()));
                }
            }
            PackValue::Object(object)
        }
        _ => PackValue::Null,
    }
}

#[cfg(test)]
mod tests {
    use super::read_api_items_bytes;

    #[test]
    fn rejects_non_flatbuffer_bytes() {
        assert!(read_api_items_bytes(b"not a pack").is_err());
    }
}

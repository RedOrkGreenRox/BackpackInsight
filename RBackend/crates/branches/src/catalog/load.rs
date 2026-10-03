//! Загрузка предметов из FlatBuffers-пака `api_items_{lang}.fb`.

use super::{fields, CatalogItem};
use rbackend_core::ItemIconService;
use std::{collections::HashMap, path::Path};

/// Читает пак и превращает его записи в [`CatalogItem`].
///
/// `images` — ключи картинок английского каталога по `id`. Для английского пака
/// передаётся `None`, и ключ считается здесь: `ItemIconService` опирается на
/// английский текст первого тултипа (`Step N` у планов ограбления).
pub fn load_items(
    path: &Path,
    images: Option<&HashMap<String, String>>,
) -> Result<Vec<CatalogItem>, String> {
    let pack = pack::read_api_items(path)?;
    let mut items = Vec::with_capacity(pack.items.len());
    for entry in &pack.items {
        let object = fields::object(&entry.value).ok_or_else(|| {
            format!(
                "{}: item {} is not an object",
                path.display(),
                entry.item_id
            )
        })?;
        let image = match images.and_then(|map| map.get(&entry.item_id)) {
            Some(key) => key.clone(),
            None => image_key(&entry.item_id, object),
        };
        items.push(CatalogItem::from_object(&entry.item_id, object, image));
    }
    Ok(items)
}

fn image_key(id: &str, object: &fields::Object) -> String {
    let rarity = fields::string(object, "rarity");
    let tooltips = fields::strings(object, "tooltips");
    ItemIconService::image_key(id, rarity.as_deref(), tooltips.first().map(String::as_str))
        .to_string()
}

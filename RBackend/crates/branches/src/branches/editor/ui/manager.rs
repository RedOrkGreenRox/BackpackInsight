//! `EditorManager` — остров редактора: каталог, поле, склад, перетаскивание.
//!
//! Сервер рисует каркас; набор предметов остров получает через [`editor_kit`]
//! после загрузки, раскладывает билд из адреса и дальше пишет каждое изменение
//! обратно в адрес (`h`, `b`, `s`), чтобы билдом можно было поделиться ссылкой.

use super::{
    dom::{pref, replace_query, set_pref},
    exchange::{Dialog, Exchange},
    field::Field,
    ghost::Ghost,
    input::listen,
    palette::Palette,
    state::{Editor, StashMode},
    storage::Storage,
    toolbar::Toolbar,
};
use crate::{
    branches::editor::{
        kit_fn::editor_kit,
        model::{url, EditorLabels},
    },
    model::Lang,
};
use leptos::prelude::*;
use std::sync::Arc;

/// Ключи `localStorage`: клетка поля и высота каталога из ручек, вид склада.
const FIELD_KEY: &str = "editor.field-cell";
const CATALOG_KEY: &str = "editor.catalog-height";
const STASH_KEY: &str = "editor.stash";

/// Хранит настройки зрителя в `localStorage`: первый запуск эффекта читает, дальше — пишет.
fn persist<T: Clone + Send + Sync + 'static>(
    key: &'static str,
    value: RwSignal<T>,
    read: fn(&str) -> Option<T>,
    write: fn(&T) -> String,
) {
    let loaded = StoredValue::new(false);
    Effect::new(move |_| {
        let current = value.get();
        if loaded.get_value() {
            set_pref(key, &write(&current));
        } else {
            loaded.set_value(true);
            if let Some(saved) = pref(key).as_deref().and_then(read) {
                value.set(saved);
            }
        }
    });
}

/// Размеры из ручек и вид склада, запомненные в этом браузере.
fn sizes(editor: Editor) {
    let px = |s: &str| s.parse::<f64>().ok().map(Some);
    let px_text = |v: &Option<f64>| v.map(|v| v.to_string()).unwrap_or_default();
    persist(FIELD_KEY, editor.field_cell, px, px_text);
    persist(CATALOG_KEY, editor.catalog_height, px, px_text);
    persist(
        STASH_KEY,
        editor.stash,
        |s| {
            Some(if s == "list" {
                StashMode::List
            } else {
                StashMode::Gravity
            })
        },
        |m| {
            if *m == StashMode::List {
                "list"
            } else {
                "gravity"
            }
            .to_owned()
        },
    );
}

/// Остров редактора. `code` — билд из адреса страницы.
#[island(lazy)]
#[allow(clippy::must_use_candidate)]
pub fn EditorManager(lang: Lang, labels: EditorLabels, code: url::UrlCode) -> impl IntoView {
    let editor = Editor::new((!code.hero.is_empty()).then(|| code.hero.clone()));
    provide_context(editor);
    listen(editor);
    let dialog = RwSignal::new(None::<Dialog>);
    let loaded = StoredValue::new(false);

    // Набор предметов приходит один раз; затем из адреса раскладывается билд.
    Effect::new(move |_| {
        if loaded.get_value() {
            return;
        }
        loaded.set_value(true);
        let code = code.clone();
        leptos::task::spawn_local(async move {
            let Ok(kit) = editor_kit(lang).await else {
                return;
            };
            let kit = Arc::new(kit.indexed());
            editor
                .board
                .set(url::decode(&kit, &code.field, &code.storage));
            editor.kit.set(Some(kit));
        });
    });
    // Каждое изменение билда — в адрес страницы.
    Effect::new(move |_| {
        let Some(kit) = editor.kit.get() else { return };
        let hero = editor.hero.get().unwrap_or_default();
        let (field, storage) = editor
            .board
            .with(|b| (url::encode_field(&kit, b), url::encode_storage(&kit, b)));
        replace_query(&[("h", hero), ("b", field), ("s", storage)]);
    });

    sizes(editor);
    let cell = move || {
        editor
            .field_cell
            .get()
            .map(|px| format!("--field-cell:{px}px"))
    };
    view! {
        <div class="ed-editor" style=cell class:ed-dragging=move || editor.drag.with(|d| d.as_ref().is_some_and(|d| d.lifted.is_some()))>
            <div class="ed-board">
                <Toolbar labels=labels.clone() dialog/>
                <Field label=labels.inventory.clone() info=labels.info.clone() hint=labels.hint.clone() resize=labels.resize.clone()/>
            </div>
            <div class="ed-stash">
                <Storage title=labels.storage.clone()/>
                <Palette labels=labels.clone()/>
            </div>
            <Ghost/>
            <Exchange labels dialog/>
        </div>
    }
}

//! `EditorManager` — остров редактора: каталог, поле, склад, перетаскивание.
//!
//! Сервер рисует каркас; набор предметов остров получает через [`editor_kit`]
//! после загрузки, раскладывает билд из адреса и дальше пишет каждое изменение
//! обратно в адрес (`h`, `b`, `s`), чтобы билдом можно было поделиться ссылкой.

use super::{
    dom::replace_query,
    exchange::{Dialog, Exchange},
    field::Field,
    ghost::Ghost,
    input::listen,
    palette::Palette,
    state::Editor,
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

    let hint = labels.hint.clone();
    view! {
        <div class="ed-editor" class:ed-dragging=move || editor.drag.with(|d| d.as_ref().is_some_and(|d| d.lifted.is_some()))>
            <div class="ed-board">
                <Toolbar labels=labels.clone() dialog/>
                <h2 class="ed-heading">{labels.inventory.clone()}</h2>
                <Field label=labels.inventory.clone()/>
                <p class="ed-hint">{hint}</p>
                <Storage title=labels.storage.clone() empty=labels.storage_empty.clone()/>
            </div>
            <Palette labels=labels.clone()/>
            <Ghost/>
            <Exchange labels dialog/>
        </div>
    }
}

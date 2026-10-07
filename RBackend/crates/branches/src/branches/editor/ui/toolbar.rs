//! Панель над полем: герой, режим сумок, сброс, импорт и экспорт билда.

use super::{exchange::Dialog, state::Editor};
use crate::branches::editor::model::EditorLabels;
use leptos::prelude::*;

/// Панель кнопок.
#[component]
#[allow(clippy::must_use_candidate)]
pub fn Toolbar(labels: EditorLabels, dialog: RwSignal<Option<Dialog>>) -> impl IntoView {
    let editor = Editor::get();
    let bag_mode = move || editor.board.with(|b| b.bag_mode);
    let heroes = move || {
        let current = editor.hero.get();
        editor.kit.get().map(|kit| {
            kit.heroes()
                .into_iter()
                .map(|hero| {
                    let selected = current.as_deref() == Some(hero.as_str());
                    view! { <option value=hero.clone() selected=selected>{hero.clone()}</option> }
                })
                .collect_view()
        })
    };
    view! {
        <div class="ed-toolbar">
            <label class="ed-hero">
                <span>{labels.hero.clone()}</span>
                <select on:change=move |ev| {
                    let value = event_target_value(&ev);
                    editor.hero.set((!value.is_empty()).then_some(value));
                }>
                    <option value="">{labels.hero_all.clone()}</option>
                    {heroes}
                </select>
            </label>
            <button
                class="ed-button"
                class:ed-on=bag_mode
                aria-pressed=move || bag_mode().to_string()
                on:click=move |_| editor.edit(|kit, board| board.set_bag_mode(kit, !board.bag_mode))
            >
                {labels.bag_mode.clone()}
            </button>
            <button class="ed-button" on:click=move |_| editor.edit(|_, board| board.reset())>
                {labels.reset.clone()}
            </button>
            <button class="ed-button" on:click=move |_| dialog.set(Some(Dialog::Import))>
                {labels.import.clone()}
            </button>
            <button class="ed-button" on:click=move |_| dialog.set(Some(Dialog::Export))>
                {labels.export.clone()}
            </button>
        </div>
    }
}

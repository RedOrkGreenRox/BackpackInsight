//! Окно импорта и экспорта билда в формате экспорта игры.

use super::{dom::json_data_url, state::Editor};
use crate::branches::editor::model::{BuildFile, EditorLabels};
use leptos::prelude::*;

/// Какое окно открыто.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Dialog {
    /// Вставить JSON из игры.
    Import,
    /// Забрать JSON текущего билда.
    Export,
}

/// JSON текущего билда.
fn export_json(editor: Editor) -> String {
    let Some(kit) = editor.kit_now() else {
        return String::new();
    };
    let hero = editor.hero.get_untracked();
    let file = editor
        .board
        .with_untracked(|board| BuildFile::export(&kit, board, hero.as_deref()));
    serde_json::to_string_pretty(&file).unwrap_or_default()
}

/// Читает JSON и раскладывает билд; возвращает сообщение для окна (пустое — всё хорошо).
fn import_json(editor: Editor, text: &str, labels: &EditorLabels) -> String {
    let Some(kit) = editor.kit_now() else {
        return labels.loading.clone();
    };
    let Ok(file) = serde_json::from_str::<BuildFile>(text) else {
        return labels.import_error.clone();
    };
    let imported = file.import(&kit);
    editor.board.set(imported.board);
    if imported.hero.is_some() {
        editor.hero.set(imported.hero);
    }
    if imported.unknown.is_empty() {
        String::new()
    } else {
        labels.unknown.replace("{0}", &imported.unknown.join(", "))
    }
}

/// Окно.
#[component]
#[allow(clippy::must_use_candidate)]
pub fn Exchange(labels: EditorLabels, dialog: RwSignal<Option<Dialog>>) -> impl IntoView {
    let editor = Editor::get();
    let text = RwSignal::new(String::new());
    let message = RwSignal::new(String::new());
    Effect::new(move |_| {
        let opened = dialog.get();
        message.set(String::new());
        text.set(match opened {
            Some(Dialog::Export) => export_json(editor),
            _ => String::new(),
        });
    });
    let close = move || dialog.set(None);
    let exporting = move || dialog.get() == Some(Dialog::Export);
    let open = move || dialog.get().is_some();
    let labels = StoredValue::new(labels);
    let label = move |pick: fn(&EditorLabels) -> &String| labels.with_value(|l| pick(l).clone());
    let apply = move |_| {
        let note = labels.with_value(|l| import_json(editor, &text.get_untracked(), l));
        if note.is_empty() {
            close();
        }
        message.set(note);
    };
    view! {
        <Show when=open>
            <div class="ed-backdrop" on:click=move |_| close()>
                <div class="ed-dialog" role="dialog" aria-modal="true" on:click=|ev| ev.stop_propagation()>
                    <h2 class="ed-heading">
                        {move || if exporting() { label(|l| &l.export) } else { label(|l| &l.import) }}
                    </h2>
                    <Show when=move || !exporting()>
                        <p class="ed-hint">{label(|l| &l.import_hint)}</p>
                    </Show>
                    <textarea
                        class="ed-json"
                        spellcheck="false"
                        readonly=exporting
                        prop:value=move || text.get()
                        on:input=move |ev| text.set(event_target_value(&ev))
                    ></textarea>
                    <p class="ed-message" aria-live="polite">{move || message.get()}</p>
                    <div class="ed-dialog-actions">
                        <Show
                            when=exporting
                            fallback=move || view! { <button class="ed-button" on:click=apply>{label(|l| &l.apply)}</button> }
                        >
                            <a class="ed-button" download="build.json" href=move || json_data_url(&text.get())>
                                {label(|l| &l.download)}
                            </a>
                        </Show>
                        <button class="ed-button" on:click=move |_| close()>{label(|l| &l.close)}</button>
                    </div>
                </div>
            </div>
        </Show>
    }
}

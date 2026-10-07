//! Панель над полем: портрет героя, иконки сброса, режима сумок и вида склада,
//! кнопки импорта и экспорта билда. Иконки — из игры (`images/editor/icons/`).

use super::{
    exchange::Dialog,
    hero::HeroPicker,
    state::{Editor, StashMode},
};
use crate::branches::editor::model::EditorLabels;
use leptos::prelude::*;

/// Картинка иконки `name`.
fn icon(name: &str) -> String {
    format!("/images/editor/icons/{name}.webp")
}

/// Кнопка-иконка: подпись — во всплывающей подсказке и для экранных дикторов.
#[component]
#[allow(clippy::must_use_candidate)]
fn IconButton(
    #[prop(into)] name: Signal<&'static str>,
    #[prop(into)] label: Signal<String>,
    #[prop(into, optional)] pressed: Option<Signal<bool>>,
    on_press: impl Fn() + 'static,
) -> impl IntoView {
    view! {
        <button
            class="ed-icon"
            class:ed-on=move || pressed.is_some_and(|p| p.get())
            aria-pressed=move || pressed.map(|p| p.get().to_string())
            aria-label=label
            title=label
            on:click=move |_| on_press()
        >
            <img src=move || icon(name.get()) alt="" width="40" height="40"/>
        </button>
    }
}

/// Панель кнопок.
#[component]
#[allow(clippy::must_use_candidate)]
pub fn Toolbar(labels: EditorLabels, dialog: RwSignal<Option<Dialog>>) -> impl IntoView {
    let editor = Editor::get();
    let bag_mode = Signal::derive(move || editor.board.with(|b| b.bag_mode));
    let gravity = move || editor.stash.get() == StashMode::Gravity;
    // Иконка показывает, каким склад станет по нажатию.
    let stash_icon = Signal::derive(move || {
        if gravity() {
            "stash-list"
        } else {
            "stash-gravity"
        }
    });
    let stash_label = {
        let (list, fall) = (labels.stash_list.clone(), labels.stash_gravity.clone());
        Signal::derive(move || {
            if gravity() {
                list.clone()
            } else {
                fall.clone()
            }
        })
    };
    view! {
        <div class="ed-toolbar">
            <HeroPicker label=labels.hero.clone() all=labels.hero_all.clone()/>
            <IconButton name="reset" label=labels.reset.clone() on_press=move || editor.edit(|_, board| board.reset())/>
            <IconButton
                name="bag-mode"
                label=labels.bag_mode.clone()
                pressed=bag_mode
                on_press=move || editor.edit(|kit, board| board.set_bag_mode(kit, !board.bag_mode))
            />
            <IconButton
                name=stash_icon
                label=stash_label
                on_press=move || editor.stash.update(|m| {
                    *m = if *m == StashMode::Gravity { StashMode::List } else { StashMode::Gravity };
                })
            />
            <span class="ed-toolbar-gap"></span>
            <button class="ed-button" on:click=move |_| dialog.set(Some(Dialog::Import))>
                {labels.import.clone()}
            </button>
            <button class="ed-button" on:click=move |_| dialog.set(Some(Dialog::Export))>
                {labels.export.clone()}
            </button>
        </div>
    }
}

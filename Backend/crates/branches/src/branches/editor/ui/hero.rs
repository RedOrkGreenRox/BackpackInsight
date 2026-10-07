//! Кнопка-портрет героя: показывает героя билда, по нажатию открывает список героев.
//!
//! Портреты — круглые значки героев из игры (`images/editor/heroes/<герой>.webp`);
//! пока герой не выбран, на кнопке значок общих предметов (`shared`).

use super::state::Editor;
use crate::branches::editor::model::kit::SHARED_HERO;
use leptos::prelude::*;

/// Портрет героя; `None` — герой не выбран. Значок назван первым словом имени
/// (`Hob Gang` → `hob`).
fn portrait(hero: Option<&str>) -> String {
    let name = hero.unwrap_or(SHARED_HERO);
    let file = name.split_whitespace().next().unwrap_or(name);
    format!("/images/editor/heroes/{}.webp", file.to_lowercase())
}

/// Кнопка героя и всплывающий список. `label` — «Герой», `all` — «Любой герой».
#[component]
#[allow(clippy::must_use_candidate)]
pub fn HeroPicker(label: String, all: String) -> impl IntoView {
    let editor = Editor::get();
    let open = RwSignal::new(false);
    let choose = move |hero: Option<String>| {
        editor.hero.set(hero);
        open.set(false);
    };
    let name = {
        let all = all.clone();
        move || editor.hero.get().unwrap_or_else(|| all.clone())
    };
    let title = {
        let label = label.clone();
        move || format!("{label}: {}", name())
    };
    let option = move |hero: Option<String>, text: String| {
        let current = editor.hero.with(|h| *h == hero);
        let src = portrait(hero.as_deref());
        let tip = text.clone();
        view! {
            <button class="ed-hero-option" class:ed-on=current role="menuitemradio" aria-checked=current.to_string()
                title=tip on:click=move |_| choose(hero.clone())>
                <img src=src alt="" width="48" height="48"/>
                <span>{text}</span>
            </button>
        }
    };
    let options = move || {
        let heroes = editor
            .kit
            .with(|k| k.as_ref().map(|k| k.heroes()).unwrap_or_default());
        let first = option(None, all.clone());
        let rest = heroes
            .into_iter()
            .map(|h| option(Some(h.clone()), h))
            .collect_view();
        view! { {first} {rest} }
    };
    view! {
        <div class="ed-hero">
            <button
                class="ed-portrait"
                aria-haspopup="menu"
                aria-expanded=move || open.get().to_string()
                aria-label=title.clone()
                title=title
                on:click=move |_| open.update(|o| *o = !*o)
            >
                <img src=move || portrait(editor.hero.get().as_deref()) alt="" width="48" height="48"/>
            </button>
            <Show when=move || open.get()>
                <button class="ed-hero-backdrop" tabindex="-1" aria-hidden="true" on:click=move |_| open.set(false)></button>
                <div class="ed-heroes" role="menu" aria-label=label.clone()
                    on:keydown=move |ev| if ev.key() == "Escape" { open.set(false) }>
                    {options.clone()}
                </div>
            </Show>
        </div>
    }
}

//! Каталог вместо магазина: поиск, вид, редкость, сортировка; герой берётся из билда.
//! Предмет из каталога перетаскивается на поле или на склад.

use super::{drag::Origin, input::start, piece::PieceArt, state::Editor};
use crate::branches::editor::model::{
    filter::rarities, EditorLabels, Filter, Kind, Orientation, SortBy,
};
use leptos::prelude::*;

/// Сколько карточек показывать за раз.
const PAGE: usize = 60;

/// Панель каталога.
#[component]
#[allow(clippy::must_use_candidate)]
pub fn Palette(labels: EditorLabels) -> impl IntoView {
    let editor = Editor::get();
    let filter = RwSignal::new(Filter::default());
    let limit = RwSignal::new(PAGE);
    let found = Memo::new(move |_| {
        let kit = editor.kit.get()?;
        let hero = editor.hero.get();
        Some(filter.with(|f| Filter { hero, ..f.clone() }.apply(&kit)))
    });
    let set = move |change: Box<dyn FnOnce(&mut Filter)>| {
        filter.update(|f| change(f));
        limit.set(PAGE);
    };
    let rarity_options = move || {
        editor.kit.get().map(|kit| {
            rarities(&kit)
                .into_iter()
                .map(|r| view! { <option value=r.clone()>{r.clone()}</option> })
                .collect_view()
        })
    };
    let kinds = Kind::ALL
        .iter()
        .map(|&(_, code)| {
            let text = match code {
                "bags" => labels.kind_bags.clone(),
                "items" => labels.kind_items.clone(),
                _ => labels.kind_all.clone(),
            };
            view! { <option value=code>{text}</option> }
        })
        .collect_view();
    let sorts = SortBy::ALL
        .iter()
        .map(|&(_, code)| {
            let text = match code {
                "name" => labels.sort_name.clone(),
                "price" => labels.sort_price.clone(),
                _ => labels.sort_rarity.clone(),
            };
            view! { <option value=code>{text}</option> }
        })
        .collect_view();
    let shown = move || {
        found
            .get()
            .unwrap_or_default()
            .into_iter()
            .take(limit.get())
            .collect::<Vec<_>>()
    };
    let more = move || found.with(|f| f.as_ref().is_some_and(|f| f.len() > limit.get()));
    let loading = move || editor.kit.with(Option::is_none);
    let loading_text = labels.loading.clone();
    let more_text = labels.more.clone();
    view! {
        <div class="ed-catalog" role="region" node_ref=editor.catalog aria-label=labels.catalog.clone()>
            <h2 class="ed-heading">{labels.catalog.clone()}</h2>
            <div class="ed-controls">
                <input
                    type="search"
                    class="ed-search"
                    placeholder=labels.search.clone()
                    aria-label=labels.search.clone()
                    on:input=move |ev| {
                        let value = event_target_value(&ev);
                        set(Box::new(move |f| f.query = value));
                    }
                />
                <select aria-label=labels.kind.clone() on:change=move |ev| {
                    let kind = Kind::parse(&event_target_value(&ev));
                    set(Box::new(move |f| f.kind = kind));
                }>{kinds}</select>
                <select aria-label=labels.rarity.clone() on:change=move |ev| {
                    let value = event_target_value(&ev);
                    set(Box::new(move |f| f.rarity = (!value.is_empty()).then_some(value)));
                }>
                    <option value="">{labels.rarity_all.clone()}</option>
                    {rarity_options}
                </select>
                <select aria-label=labels.sort.clone() on:change=move |ev| {
                    let sort = SortBy::parse(&event_target_value(&ev));
                    set(Box::new(move |f| f.sort = sort));
                }>{sorts}</select>
            </div>
            <Show when=loading>
                <p class="ed-loading">{loading_text.clone()}</p>
            </Show>
            <div class="ed-cards">
                <For each=shown key=|piece| *piece children=move |piece| view! { <Card piece/> }/>
            </div>
            <Show when=more>
                <button class="ed-button ed-more" on:click=move |_| limit.update(|l| *l += PAGE)>
                    {more_text.clone()}
                </button>
            </Show>
        </div>
    }
}

/// Карточка каталога.
#[component]
#[allow(clippy::must_use_candidate)]
fn Card(piece: usize) -> impl IntoView {
    let editor = Editor::get();
    let Some(kit) = editor.kit_now() else {
        return ().into_any();
    };
    let item = kit.item(piece).clone();
    let rarity = format!("ed-card-name rarity-{}", item.rarity.to_lowercase());
    let b = item.bounds();
    let fit = format!("--w:{};--h:{}", b.width(), b.height());
    view! {
        <div class="ed-card" title=item.name.clone() on:pointerdown=move |ev| start(editor, Origin::Catalog, piece, &ev)>
            <div class="ed-card-art" style=fit>
                <PieceArt item=item.clone() orient=Orientation::Up/>
            </div>
            <span class=rarity>{item.name.clone()}</span>
        </div>
    }
    .into_any()
}

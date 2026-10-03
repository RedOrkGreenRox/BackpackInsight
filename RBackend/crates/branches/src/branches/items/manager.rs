//! `ItemsManager` — остров каталога: заголовок, поле поиска и сетка с подгрузкой.
//!
//! Разметка повторяет TS-версию (`wiki-header`, `search-container`, `items-grid`).
//! Без JavaScript работает форма (`/items?q=…`). С WASM остров ищет на лету через
//! [`search_items`], обновляет адресную строку и догружает карточки при прокрутке.

use super::{card::ItemCardView, scroll::near_bottom, search_fn::search_items, url::items_href};
use crate::model::{ItemsLabels, ItemsPage, Lang, EAGER_IMAGES};
use leptos::prelude::*;
use std::time::Duration;

/// Пауза после ввода перед запросом к серверу.
const DEBOUNCE: Duration = Duration::from_millis(200);

/// Остров каталога. Пропсы приходят с сервера: язык, исходный запрос, первая порция, подписи.
#[island]
#[allow(clippy::must_use_candidate)]
pub fn ItemsManager(
    lang: Lang,
    query: String,
    initial: ItemsPage,
    labels: ItemsLabels,
) -> impl IntoView {
    let text = RwSignal::new(query);
    let cards = RwSignal::new(initial.cards);
    let total = RwSignal::new(initial.total);
    let page = RwSignal::new(initial.page);
    let has_more = RwSignal::new(initial.has_more);
    let loading = RwSignal::new(false);
    let last_request = StoredValue::new(0u64);
    let timer = StoredValue::new(None::<TimeoutHandle>);

    // Ответы на устаревшие запросы отбрасываются по номеру запроса.
    let fetch = move |query: String, next: usize| {
        let id = last_request.get_value() + 1;
        last_request.set_value(id);
        loading.set(true);
        leptos::task::spawn_local(async move {
            let result = search_items(lang, query, next).await;
            if last_request.get_value() != id {
                return;
            }
            loading.set(false);
            let Ok(result) = result else { return };
            if next == 0 {
                cards.set(result.cards);
            } else {
                cards.update(|list| list.extend(result.cards));
            }
            total.set(result.total);
            page.set(result.page);
            has_more.set(result.has_more);
        });
    };
    let on_input = move |ev: leptos::ev::Event| {
        let value = event_target_value(&ev);
        text.set(value.clone());
        if let Some(handle) = timer.get_value() {
            handle.clear();
        }
        let handle = set_timeout_with_handle(
            move || {
                replace_url(&items_href(&value, 0));
                fetch(value, 0);
            },
            DEBOUNCE,
        );
        timer.set_value(handle.ok());
    };
    let on_submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        fetch(text.get_untracked(), 0);
    };
    // Бесконечная прокрутка, как в TS-версии: следующая порция у нижнего края.
    let scroll = window_event_listener(leptos::ev::scroll, move |_| {
        if has_more.get_untracked() && !loading.get_untracked() && near_bottom() {
            fetch(text.get_untracked(), page.get_untracked() + 1);
        }
    });
    on_cleanup(move || scroll.remove());
    let found = labels.found.clone();

    view! {
        <div class="wiki-header">
            <h1 class="main-title" data-aos="fade-down">{labels.title}</h1>
            <p class="wiki-subtitle">{labels.subtitle}</p>
            <form class="search-container" data-aos="fade-up" role="search" action="/items" method="get" on:submit=on_submit>
                <div class="search-input-wrapper">
                    <input
                        type="search"
                        name="q"
                        id="itemSearch"
                        class="search-input-rich"
                        placeholder=labels.placeholder.clone()
                        aria-label=labels.placeholder
                        autocomplete="off"
                        spellcheck="false"
                        prop:value=move || text.get()
                        on:input=on_input
                    />
                </div>
            </form>
        </div>
        <p class="sr-only" aria-live="polite">{move || found.replace("{0}", &total.get().to_string())}</p>
        <div class="items-grid" id="wikiItemsGrid">
            <For
                each=move || cards.get().into_iter().enumerate()
                key=|(_, card)| card.slug.clone()
                children=move |(index, card)| view! { <ItemCardView card index eager=index < EAGER_IMAGES/> }
            />
        </div>
        <Show when=move || total.get() == 0>
            <p class="items-empty">{labels.empty.clone()}</p>
        </Show>
        <div id="itemsScrollSentinel" class="items-scroll-sentinel" aria-hidden="true"></div>
    }
}

/// Меняет адрес без перезагрузки, чтобы ссылкой на поиск можно было поделиться.
fn replace_url(url: &str) {
    #[cfg(feature = "hydrate")]
    if let Ok(history) = window().history() {
        let _ = history.replace_state_with_url(&wasm_bindgen::JsValue::NULL, "", Some(url));
    }
    #[cfg(not(feature = "hydrate"))]
    let _ = url;
}

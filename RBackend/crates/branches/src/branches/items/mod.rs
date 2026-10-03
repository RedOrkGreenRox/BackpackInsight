//! Ветка каталога предметов.
//!
//! - [`ItemsBranch`] (только сервер) — страница `/items`: заголовок и первая порция карточек;
//! - [`manager::ItemsManager`] — остров: поиск по мере ввода и подгрузка при прокрутке;
//! - [`search_fn::search_items`] — серверная функция, через которую остров получает порции;
//! - [`card::ItemCardView`] — карточка, общая для SSR и острова;
//! - [`url`] — ссылки каталога (`/items?q=…&page=…`);
//! - `scroll` — проверка «докрутили почти до конца» для подгрузки.

pub mod card;
pub mod manager;
mod scroll;
pub mod search_fn;
pub mod url;

#[cfg(feature = "ssr")]
mod branch;
#[cfg(feature = "ssr")]
pub use branch::ItemsBranch;

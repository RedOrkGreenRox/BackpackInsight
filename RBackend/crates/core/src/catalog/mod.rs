//! Catalog foundations: typed IDs, string interning, and first DOD columns.
//!
//! This is the first step toward data-oriented catalog storage. Full
//! FlatBuffer packs will grow from this root later.

mod columns;
mod ids;
mod strings;

pub use columns::{CatalogColumns, CatalogItemInput};
pub use ids::{HeroId, ItemId, StringId};
pub use strings::StringPool;

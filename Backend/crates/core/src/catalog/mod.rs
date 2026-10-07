//! Catalog foundations: the typed game export, typed IDs, string interning,
//! and first DOD columns.

mod columns;
mod export;
mod ids;
mod strings;

pub use columns::{CatalogColumns, CatalogItemInput};
pub use export::{
    CatalogExport, Cell, CombatStats, ExportError, ItemDef, LevelChange, Levels, Recipe,
};
pub use ids::{HeroId, ItemId, StringId};
pub use strings::StringPool;

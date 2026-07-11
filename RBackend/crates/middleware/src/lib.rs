//! middleware — backend-owned decoders for FlatBuffer API contracts.

mod error;
mod items;
mod profile;

pub use error::{decode_error, ErrorData};
pub use items::{decode_items, ItemData, ItemsData};
pub use profile::{decode_profile, HeroData, ProfileData, ProfileItemData};

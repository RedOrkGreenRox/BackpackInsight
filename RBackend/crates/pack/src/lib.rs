//! pack — runtime readers/writers for generated FlatBuffer packs.

mod api_items;
mod catalog;
mod error;
pub mod generated;
mod profile;

pub use api_items::{
    read_api_items, read_api_items_bytes, ApiItemEntry, ApiItemsPackInfo, PackValue,
};
pub use catalog::{
    read_catalog_summary, read_catalog_summary_bytes, CatalogPackInfo, CatalogPackItem,
};
pub use error::{build_api_error_bytes, read_api_error_bytes, ApiErrorPack};
pub use profile::{
    build_profile_view_bytes, read_profile_view_bytes, read_profile_view_info_bytes,
    ProfileHeroPack, ProfileItemPack, ProfileViewInfo, ProfileViewPack,
};

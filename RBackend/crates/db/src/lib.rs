//! db — SQLx persistence for RBackend.
//!
//! Dual-driver support: Postgres (production) and SQLite (local dev).
//! The active driver is selected at runtime via `DATABASE_URL`:
//!   * `sqlite:./path.db` → SQLite (bundled via libsqlite3-sys, no system dep).
//!   * `postgres://...`  → Postgres.
//! All public APIs operate on `&AnyPool`, so callers do not need to know which
//! driver is in use. Migrations live in `migrations/pg/` and `migrations/sqlite/`.

mod profile;
mod seed;

use sqlx::any::{install_default_drivers, Any, AnyPoolOptions};
use sqlx::Pool;
use std::env;

pub use profile::{save_profile, HeroSave, ItemSave, ProfileSave, SavedProfile};
pub use seed::seed_itemdefinitions_if_empty;

pub(crate) type AnyPool = Pool<Any>;

#[derive(Debug, Clone)]
pub struct Db {
    pool: AnyPool,
}

impl Db {
    pub async fn connect_from_env_if_enabled() -> Result<Option<Self>, String> {
        if !db_enabled() {
            return Ok(None);
        }
        // Install every driver compiled into sqlx (postgres + sqlite) once.
        // Safe to call multiple times; subsequent calls are no-ops.
        install_default_drivers();

        let url = database_url()?;
        let pool = AnyPoolOptions::new()
            .max_connections(5)
            .connect(&url)
            .await
            .map_err(|err| format!("database connect failed: {err}"))?;

        if url.starts_with("sqlite:") {
            sqlx::migrate!("./migrations/sqlite")
                .run(&pool)
                .await
                .map_err(|err| format!("sqlite migration failed: {err}"))?;
        } else {
            sqlx::migrate!("./migrations/pg")
                .run(&pool)
                .await
                .map_err(|err| format!("postgres migration failed: {err}"))?;
        }
        Ok(Some(Self { pool }))
    }

    pub fn pool(&self) -> &AnyPool {
        &self.pool
    }
}

fn db_enabled() -> bool {
    if let Ok(value) = env::var("ROOT_DB_ENABLED") {
        return value == "true" || value == "1";
    }
    env::var("DATABASE_URL").is_ok() || env::var("POSTGRES_SERVER").is_ok()
}

fn database_url() -> Result<String, String> {
    if let Ok(url) = env::var("DATABASE_URL") {
        if !url.trim().is_empty() {
            return Ok(url);
        }
    }
    let user = env::var("POSTGRES_USER").unwrap_or_else(|_| "admin".to_string());
    let password = env::var("POSTGRES_PASSWORD").unwrap_or_else(|_| "secret".to_string());
    let server = env::var("POSTGRES_SERVER").unwrap_or_else(|_| "localhost".to_string());
    let port = env::var("POSTGRES_PORT").unwrap_or_else(|_| "5432".to_string());
    let db = env::var("POSTGRES_DB").unwrap_or_else(|_| "backpack_insight".to_string());
    Ok(format!("postgres://{user}:{password}@{server}:{port}/{db}"))
}

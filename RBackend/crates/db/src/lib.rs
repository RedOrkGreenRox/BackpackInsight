//! db — SQLx persistence for RBackend.

mod profile;

use sqlx::{postgres::PgPoolOptions, PgPool};
use std::env;

pub use profile::{save_profile, ProfileSave, SavedProfile};

#[derive(Debug, Clone)]
pub struct Db {
    pool: PgPool,
}

impl Db {
    pub async fn connect_from_env_if_enabled() -> Result<Option<Self>, String> {
        if !db_enabled() {
            return Ok(None);
        }
        let url = database_url()?;
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&url)
            .await
            .map_err(|err| format!("database connect failed: {err}"))?;
        sqlx::migrate!("./migrations")
            .run(&pool)
            .await
            .map_err(|err| format!("database migration failed: {err}"))?;
        Ok(Some(Self { pool }))
    }

    pub fn pool(&self) -> &PgPool {
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

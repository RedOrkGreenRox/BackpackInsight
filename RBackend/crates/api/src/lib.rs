//! api — Axum backend for RBackend.

mod profile;
mod routes;
mod security;
mod seo;
mod state;

use axum::{
    extract::DefaultBodyLimit,
    http::{header, HeaderValue, Method},
    middleware,
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

pub use state::AppState;

pub fn app(state: AppState) -> Router {
    let api_routes = Router::new()
        .route("/api/items.fb", get(routes::packs::items_pack))
        .route(
            "/api/catalog-summary.fb",
            get(routes::packs::catalog_summary_pack),
        )
        .route("/api/profile.fb", post(routes::profile_binary::profile_fb))
        .route_layer(DefaultBodyLimit::max(state.max_body_bytes))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            security::secret::require_api_secret,
        ));

    Router::new()
        .route("/", get(routes::root::root))
        .route("/health", get(routes::health::health))
        .route("/ready", get(routes::health::ready))
        .route("/sitemap.xml", get(routes::sitemap::sitemap))
        .route("/api/sitemap", get(routes::sitemap::sitemap))
        .route("/robots.txt", get(routes::robots::robots))
        .merge(api_routes)
        .layer(cors_layer(&state))
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}

pub async fn serve(addr: SocketAddr) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let state = AppState::discover().await?;
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app(state)).await?;
    Ok(())
}

fn cors_layer(state: &AppState) -> CorsLayer {
    let origin = state
        .cors_origin
        .parse::<HeaderValue>()
        .unwrap_or_else(|_| HeaderValue::from_static("https://backpackinsight.pages.dev"));

    CorsLayer::new()
        .allow_origin(origin)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([
            header::CONTENT_TYPE,
            header::HeaderName::from_static("x-internal-secret"),
        ])
}

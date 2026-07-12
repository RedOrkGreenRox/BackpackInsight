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
    // Rate-limit ONLY the POST /api/profile.fb endpoint (parity with legacy
    // Python slowapi limiter). GET endpoints are cached 1h upstream and don't
    // need per-IP limiting. Mounted before the API-secret check.
    let profile_route = Router::new()
        .route("/api/profile.fb", post(routes::profile_binary::profile_fb))
        .route_layer(DefaultBodyLimit::max(state.max_body_bytes))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            security::rate_limit::rate_limit_profile,
        ));

    let api_routes = Router::new()
        .route("/api/items.fb", get(routes::packs::items_pack))
        .route(
            "/api/catalog-summary.fb",
            get(routes::packs::catalog_summary_pack),
        )
        .merge(profile_route)
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
    axum::serve(listener, app(state))
        .with_graceful_shutdown(shutdown_signal())
        .await?;
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

/// Wait for SIGINT + SIGTERM (unix) or Ctrl-C (other platforms).
async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .unwrap_or_else(|err| tracing::warn!("ctrl_c signal install failed: {err}"));
    };

    #[cfg(unix)]
    let terminate = async {
        use tokio::signal::unix::{signal, SignalKind};
        let mut sigterm = signal(SignalKind::terminate())
            .unwrap_or_else(|err| panic!("install SIGTERM handler: {err}"));
        let mut sigint = signal(SignalKind::interrupt())
            .unwrap_or_else(|err| panic!("install SIGINT handler: {err}"));
        tokio::select! {
            _ = sigterm.recv() => tracing::info!("received SIGTERM, shutting down"),
            _ = sigint.recv() => tracing::info!("received SIGINT, shutting down"),
        }
    };

    #[cfg(not(unix))]
    let terminate = async {
        std::future::pending::<()>().await;
    };

    tokio::select! {
        _ = ctrl_c => tracing::info!("received Ctrl-C, shutting down"),
        _ = terminate => {}
    }
}

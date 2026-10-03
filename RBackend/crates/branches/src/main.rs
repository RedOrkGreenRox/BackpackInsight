//! Бинарник `branches`: SSR-сайт `BackpackInsight` на Leptos + Axum (`BranchRunner::serve`).

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info"));
    tracing_subscriber::fmt().with_env_filter(filter).init();
    branches::roots::BranchRunner::serve().await
}

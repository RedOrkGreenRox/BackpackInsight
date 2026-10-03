//! Бинарник `branches`: SSR-сайт `BackpackInsight` на Leptos + Axum (`BranchRunner::serve`).

use std::process::ExitCode;

#[tokio::main]
async fn main() -> ExitCode {
    let filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info"));
    tracing_subscriber::fmt().with_env_filter(filter).init();
    match branches::roots::BranchRunner::serve().await {
        Ok(()) => ExitCode::SUCCESS,
        // Текст ошибки, а не `Debug`: в нём подсказка, что делать (например, `--split`).
        Err(error) => {
            tracing::error!("{error}");
            ExitCode::FAILURE
        }
    }
}

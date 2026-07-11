use crate::{seo::sitemap::generate_sitemap, AppState};
use axum::{
    body::Body,
    extract::State,
    http::{header, StatusCode},
    response::Response,
};

pub async fn sitemap(State(state): State<AppState>) -> Result<Response, (StatusCode, String)> {
    let xml = generate_sitemap(&state.project_root, &state.public_base_url)
        .map_err(|error| (StatusCode::INTERNAL_SERVER_ERROR, error))?;
    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "application/xml; charset=utf-8")
        .body(Body::from(xml))
        .map_err(|error| (StatusCode::INTERNAL_SERVER_ERROR, error.to_string()))
}

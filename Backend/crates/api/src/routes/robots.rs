use crate::{seo::robots::generate_robots, AppState};
use axum::{
    body::Body,
    extract::State,
    http::{header, StatusCode},
    response::Response,
};

pub async fn robots(State(state): State<AppState>) -> Result<Response, (StatusCode, String)> {
    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "text/plain; charset=utf-8")
        .body(Body::from(generate_robots(&state.public_base_url)))
        .map_err(|error| (StatusCode::INTERNAL_SERVER_ERROR, error.to_string()))
}

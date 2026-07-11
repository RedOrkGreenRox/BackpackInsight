use crate::AppState;
use axum::{
    body::Body,
    extract::{Query, State},
    http::{header, StatusCode},
    response::Response,
};
use pack::{build_api_error_bytes, ApiErrorPack};
use serde::Deserialize;
use std::{fs, path::PathBuf};

#[derive(Debug, Clone, Deserialize)]
pub struct ItemsPackQuery {
    pub lang: Option<String>,
}

pub async fn items_pack(
    State(state): State<AppState>,
    Query(query): Query<ItemsPackQuery>,
) -> Response {
    let lang = query.lang.as_deref().unwrap_or("en");
    let file_name = match lang {
        "en" => "api_items_en.fb",
        "ru" => "api_items_ru.fb",
        other => {
            return error_response(
                StatusCode::BAD_REQUEST,
                "bad_request",
                format!("unsupported lang: {other}"),
            );
        }
    };

    pack_response(
        state
            .project_root
            .join("RBackend/generated")
            .join(file_name),
    )
}

pub async fn catalog_summary_pack(State(state): State<AppState>) -> Response {
    pack_response(
        state
            .project_root
            .join("RBackend/generated/catalog_summary.fb"),
    )
}

fn pack_response(path: PathBuf) -> Response {
    match fs::read(&path) {
        Ok(bytes) => binary_response(StatusCode::OK, bytes),
        Err(error) => error_response(
            StatusCode::SERVICE_UNAVAILABLE,
            "pack_not_available",
            format!("could not read {}: {error}", path.display()),
        ),
    }
}

fn error_response(status: StatusCode, code: &str, detail: String) -> Response {
    binary_response(
        status,
        build_api_error_bytes(&ApiErrorPack {
            code: code.to_string(),
            detail,
            issues: Vec::new(),
        }),
    )
}

fn binary_response(status: StatusCode, bytes: Vec<u8>) -> Response {
    let mut response = Response::new(Body::from(bytes));
    *response.status_mut() = status;
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        header::HeaderValue::from_static("application/octet-stream"),
    );
    if status == StatusCode::OK {
        response.headers_mut().insert(
            header::CACHE_CONTROL,
            header::HeaderValue::from_static("public, max-age=3600"),
        );
    }
    response
}

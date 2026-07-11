use axum::{http::StatusCode, Json};
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct ApiError {
    pub code: &'static str,
    pub detail: String,
}

impl ApiError {
    pub fn new(code: &'static str, detail: impl Into<String>) -> Self {
        Self {
            code,
            detail: detail.into(),
        }
    }

    pub fn response(self, status: StatusCode) -> (StatusCode, Json<Self>) {
        (status, Json(self))
    }
}

use crate::AppState;
use axum::{
    body::Body,
    extract::State,
    http::{header, Request, StatusCode},
    middleware::Next,
    response::Response,
};
use pack::{build_api_error_bytes, ApiErrorPack};

const INTERNAL_SECRET_HEADER: &str = "x-internal-secret";

pub async fn require_api_secret(
    State(state): State<AppState>,
    request: Request<Body>,
    next: Next,
) -> Result<Response, (StatusCode, Response)> {
    let Some(expected) = state.api_secret.as_deref() else {
        return Ok(next.run(request).await);
    };

    let provided = request
        .headers()
        .get(INTERNAL_SECRET_HEADER)
        .and_then(|value| value.to_str().ok());

    if provided.is_some_and(|value| constant_time_eq(value.as_bytes(), expected.as_bytes())) {
        return Ok(next.run(request).await);
    }

    Err((
        StatusCode::FORBIDDEN,
        binary_error(
            StatusCode::FORBIDDEN,
            "forbidden",
            "Direct access forbidden",
        ),
    ))
}

fn binary_error(status: StatusCode, code: &str, detail: &str) -> Response {
    let mut response = Response::new(Body::from(build_api_error_bytes(&ApiErrorPack {
        code: code.to_string(),
        detail: detail.to_string(),
        issues: Vec::new(),
    })));
    *response.status_mut() = status;
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        header::HeaderValue::from_static("application/octet-stream"),
    );
    response
}

pub fn constant_time_eq(left: &[u8], right: &[u8]) -> bool {
    let max_len = left.len().max(right.len());
    let mut diff = left.len() ^ right.len();

    for index in 0..max_len {
        let left_byte = left.get(index).copied().unwrap_or(0);
        let right_byte = right.get(index).copied().unwrap_or(0);
        diff |= usize::from(left_byte ^ right_byte);
    }

    diff == 0
}

#[cfg(test)]
mod tests {
    use super::constant_time_eq;

    #[test]
    fn constant_time_compare_matches_equality() {
        assert!(constant_time_eq(b"secret", b"secret"));
        assert!(!constant_time_eq(b"secret", b"Secret"));
        assert!(!constant_time_eq(b"secret", b"secret-longer"));
        assert!(!constant_time_eq(b"", b"secret"));
    }
}

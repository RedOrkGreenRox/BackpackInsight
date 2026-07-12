use crate::AppState;
use axum::{
    body::Body,
    extract::State,
    http::{header, Request, StatusCode},
    middleware::Next,
    response::Response,
};
use pack::{build_api_error_bytes, ApiErrorPack};
use subtle::ConstantTimeEq;

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

    if provided.is_some_and(|value| secret_eq(value.as_bytes(), expected.as_bytes())) {
        return Ok(next.run(request).await);
    }

    Err((
        StatusCode::FORBIDDEN,
        binary_error(StatusCode::FORBIDDEN, "forbidden", "Direct access forbidden"),
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

/// Constant-time сравнение секретов через аудированную библиотеку `subtle`.
/// Длина API-секрета не чувствительна; для равных длин — `ct_eq`.
fn secret_eq(left: &[u8], right: &[u8]) -> bool {
    if left.len() != right.len() {
        return false;
    }
    left.ct_eq(right).into()
}

#[cfg(test)]
mod tests {
    use super::secret_eq;

    #[test]
    fn equal_secrets_match() {
        assert!(secret_eq(b"secret", b"secret"));
    }

    #[test]
    fn different_case_does_not_match() {
        assert!(!secret_eq(b"secret", b"Secret"));
    }

    #[test]
    fn different_length_does_not_match() {
        assert!(!secret_eq(b"secret", b"secret-longer"));
    }

    #[test]
    fn empty_vs_non_empty_does_not_match() {
        assert!(!secret_eq(b"", b"secret"));
    }

    #[test]
    fn both_empty_match() {
        assert!(secret_eq(b"", b""));
    }
}

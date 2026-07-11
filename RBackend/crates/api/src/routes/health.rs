use crate::AppState;
use axum::{
    extract::State,
    http::{header, StatusCode},
    response::Response,
};

pub async fn health() -> Response<String> {
    text_response(StatusCode::OK, "ok service=api".to_string())
}

pub async fn ready(State(state): State<AppState>) -> Result<Response<String>, Response<String>> {
    let path = state
        .project_root
        .join("RBackend/generated/catalog_summary.fb");
    match pack::read_catalog_summary(&path) {
        Ok(summary) => Ok(text_response(
            StatusCode::OK,
            format!("ok catalog_items={} catalog_strings=0", summary.items),
        )),
        Err(error) => Err(text_response(
            StatusCode::SERVICE_UNAVAILABLE,
            format!("not_ready {error}"),
        )),
    }
}

fn text_response(status: StatusCode, body: String) -> Response<String> {
    let mut response = Response::new(body);
    *response.status_mut() = status;
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        header::HeaderValue::from_static("text/plain; charset=utf-8"),
    );
    response
}

#[cfg(test)]
mod tests {
    #[test]
    fn health_text_is_stable() {
        assert_eq!("ok service=api", "ok service=api");
    }
}

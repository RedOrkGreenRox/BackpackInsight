use axum::{http::header, response::Response};

const MESSAGE: &str = "Backpack Insight API is running";

pub async fn root() -> Response<String> {
    text_response(MESSAGE.to_string())
}

fn text_response(body: String) -> Response<String> {
    let mut response = Response::new(body);
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        header::HeaderValue::from_static("text/plain; charset=utf-8"),
    );
    response
}

#[cfg(test)]
mod tests {
    use super::MESSAGE;

    #[test]
    fn home_message_matches_current_backend() {
        assert_eq!(MESSAGE, "Backpack Insight API is running");
    }
}

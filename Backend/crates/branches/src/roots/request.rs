//! Разбор запроса: query-строка, cookie и выбор языка.

use crate::model::Lang;
use axum::http::{header, HeaderMap};

/// Имя cookie с выбранным языком.
pub const LANG_COOKIE: &str = "lang";

/// Пары `ключ=значение` из query-строки в формате `application/x-www-form-urlencoded`.
pub fn parse_query(query: Option<&str>) -> Vec<(String, String)> {
    query
        .unwrap_or_default()
        .split('&')
        .filter(|pair| !pair.is_empty())
        .map(|pair| {
            let (key, value) = pair.split_once('=').unwrap_or((pair, ""));
            (form_decode(key), form_decode(value))
        })
        .collect()
}

/// Все пары `имя=значение` из заголовков `Cookie`.
pub fn parse_cookies(headers: &HeaderMap) -> Vec<(String, String)> {
    headers
        .get_all(header::COOKIE)
        .iter()
        .filter_map(|value| value.to_str().ok())
        .flat_map(|value| value.split(';'))
        .filter_map(|pair| pair.trim().split_once('='))
        .map(|(name, value)| (name.to_string(), value.to_string()))
        .collect()
}

/// Язык запроса: `?lang=` → cookie `lang` → `Accept-Language` → английский.
/// Второй элемент — `true`, если язык пришёл из `?lang=` и его нужно запомнить в cookie.
pub fn resolve_lang(query: &[(String, String)], headers: &HeaderMap) -> (Lang, bool) {
    if let Some(lang) = query
        .iter()
        .find(|(k, _)| k == "lang")
        .and_then(|(_, v)| Lang::parse(v))
    {
        return (lang, true);
    }
    let from_cookie = parse_cookies(headers)
        .into_iter()
        .find(|(name, _)| name == LANG_COOKIE)
        .and_then(|(_, value)| Lang::parse(&value));
    if let Some(lang) = from_cookie {
        return (lang, false);
    }
    let from_header = headers
        .get(header::ACCEPT_LANGUAGE)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| {
            value
                .split(',')
                .find_map(|part| Lang::parse(part.split(';').next()?))
        });
    (from_header.unwrap_or_default(), false)
}

fn form_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'+' => out.push(b' '),
            b'%' if i + 2 < bytes.len() => {
                match input
                    .get(i + 1..i + 3)
                    .map(|hex| u8::from_str_radix(hex, 16))
                {
                    Some(Ok(byte)) => {
                        out.push(byte);
                        i += 2;
                    }
                    _ => out.push(b'%'),
                }
            }
            byte => out.push(byte),
        }
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::HeaderValue;

    #[test]
    fn decodes_form_query() {
        let query = parse_query(Some("q=%D0%BC%D0%B5%D1%87+fire&page=2&bad=%zz&flag"));
        assert_eq!(query[0], ("q".into(), "меч fire".into()));
        assert_eq!(query[1], ("page".into(), "2".into()));
        assert_eq!(query[2], ("bad".into(), "%zz".into()));
        assert_eq!(query[3], ("flag".into(), String::new()));
    }

    #[test]
    fn language_priority_is_query_cookie_header() {
        let mut headers = HeaderMap::new();
        headers.insert(
            header::ACCEPT_LANGUAGE,
            HeaderValue::from_static("ru-RU,ru;q=0.9"),
        );
        assert_eq!(resolve_lang(&[], &headers), (Lang::Ru, false));
        headers.insert(header::COOKIE, HeaderValue::from_static("a=1; lang=en"));
        assert_eq!(resolve_lang(&[], &headers), (Lang::En, false));
        let query = vec![("lang".to_string(), "ru".to_string())];
        assert_eq!(resolve_lang(&query, &headers), (Lang::Ru, true));
    }
}

//! Ссылки каталога. Работают одинаково на сервере и в WASM.

use std::fmt::Write;

/// Ссылка на каталог с запросом и номером порции (пустые значения не пишутся).
#[must_use]
pub fn items_href(query: &str, page: usize) -> String {
    let mut params = Vec::new();
    if !query.trim().is_empty() {
        params.push(format!("q={}", encode(query.trim())));
    }
    if page > 0 {
        params.push(format!("page={page}"));
    }
    if params.is_empty() {
        "/items".to_string()
    } else {
        format!("/items?{}", params.join("&"))
    }
}

/// Процентное кодирование значения query-параметра (всё, кроме `A-Z a-z 0-9 - _ . ~`).
#[must_use]
pub fn encode(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for byte in value.bytes() {
        if byte.is_ascii_alphanumeric() || matches!(byte, b'-' | b'_' | b'.' | b'~') {
            out.push(char::from(byte));
        } else {
            let _ = write!(out, "%{byte:02X}");
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::items_href;

    #[test]
    fn builds_catalog_links() {
        assert_eq!(items_href("", 0), "/items");
        assert_eq!(items_href(" меч ", 2), "/items?q=%D0%BC%D0%B5%D1%87&page=2");
        assert_eq!(items_href("a&b", 0), "/items?q=a%26b");
    }
}

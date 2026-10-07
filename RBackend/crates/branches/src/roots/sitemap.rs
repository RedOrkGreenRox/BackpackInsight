//! `Sitemap` — `/sitemap.xml` из реестра веток: страницы с `BranchSpec::sitemap` на всех языках.
//!
//! Язык сайта выбирается `?lang=` ([`super::request`]), поэтому у каждой страницы по адресу
//! на язык, связанные `hreflang`; адрес без `?lang=` — `x-default`.

use super::{BranchSpec, Gen};
use crate::model::Lang;
use axum::{
    http::header,
    response::{IntoResponse, Response},
};
use std::fmt::Write as _;

/// Генератор карты сайта.
pub struct Sitemap;

impl Sitemap {
    /// Ответ `/sitemap.xml` для базового адреса из состояния `api` (`ROOT_PUBLIC_BASE_URL`).
    #[must_use]
    pub fn response(base: &str) -> Response {
        (
            [
                (header::CONTENT_TYPE, "application/xml; charset=utf-8"),
                (header::CACHE_CONTROL, "public, max-age=3600"),
            ],
            Self::render(base, Gen::branches().iter().map(|entry| entry.spec)),
        )
            .into_response()
    }

    /// XML карты для статических путей веток, отмеченных `sitemap: true`.
    #[must_use]
    pub fn render(base: &str, specs: impl Iterator<Item = BranchSpec>) -> String {
        let base = base.trim_end_matches('/');
        let mut xml = String::from(concat!(
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n",
            "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"",
            " xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">\n",
        ));
        for spec in specs.filter(|s| s.sitemap && !s.path.contains(':')) {
            let page = format!("{base}{}", spec.path);
            let alternates = alternates(&page);
            for lang in Lang::ALL {
                let _ = write!(
                    xml,
                    "  <url>\n    <loc>{}</loc>\n{alternates}  </url>\n",
                    escape(&localized(&page, lang))
                );
            }
        }
        xml.push_str("</urlset>\n");
        xml
    }
}

fn localized(page: &str, lang: Lang) -> String {
    format!("{page}?lang={}", lang.code())
}

fn alternates(page: &str) -> String {
    let link = |hreflang: &str, href: &str| {
        format!(
            "    <xhtml:link rel=\"alternate\" hreflang=\"{hreflang}\" href=\"{}\"/>\n",
            escape(href)
        )
    };
    let mut out: String = Lang::ALL
        .iter()
        .map(|lang| link(lang.code(), &localized(page, *lang)))
        .collect();
    out.push_str(&link("x-default", page));
    out
}

fn escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

#[cfg(test)]
mod tests {
    use super::{Gen, Sitemap};

    #[test]
    fn lists_indexable_pages_per_language() {
        let xml = Sitemap::render(
            "https://example.test/",
            Gen::branches().iter().map(|e| e.spec),
        );
        assert!(xml.contains("<loc>https://example.test/?lang=en</loc>"));
        assert!(xml.contains("<loc>https://example.test/items?lang=ru</loc>"));
        assert!(xml.contains("hreflang=\"x-default\" href=\"https://example.test/items\""));
        assert!(!xml.contains("/editor"));
        assert_eq!(xml.matches("<url>").count(), 4);
    }
}

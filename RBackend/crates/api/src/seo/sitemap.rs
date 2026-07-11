use middleware::decode_items;
use rbackend_core::SlugService;
use std::{fs, path::Path};

#[derive(Debug, Clone)]
pub struct SitemapEntry {
    pub loc: String,
    pub changefreq: &'static str,
    pub priority: &'static str,
}

pub fn generate_sitemap(project_root: &Path, base_url: &str) -> Result<String, String> {
    let base = base_url.trim_end_matches('/');
    let mut entries = vec![
        SitemapEntry {
            loc: format!("{base}/"),
            changefreq: "daily",
            priority: "1.0",
        },
        SitemapEntry {
            loc: format!("{base}/items"),
            changefreq: "weekly",
            priority: "0.9",
        },
        SitemapEntry {
            loc: format!("{base}/profile"),
            changefreq: "monthly",
            priority: "0.8",
        },
    ];

    let bytes = fs::read(project_root.join("RBackend/generated/api_items_en.fb"))
        .map_err(|err| format!("could not read api_items_en.fb: {err}"))?;
    let items = decode_items(&bytes)?;
    for item in items.items {
        let slug = SlugService::to_slug(item.name.as_str());
        entries.push(SitemapEntry {
            loc: format!("{base}/item/{slug}"),
            changefreq: "monthly",
            priority: "0.7",
        });
    }

    Ok(render_sitemap(&entries))
}

fn render_sitemap(entries: &[SitemapEntry]) -> String {
    let mut xml = String::from("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    xml.push_str("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
    for entry in entries {
        xml.push_str("  <url>\n");
        xml.push_str("    <loc>");
        xml.push_str(&escape_xml(&entry.loc));
        xml.push_str("</loc>\n");
        xml.push_str("    <changefreq>");
        xml.push_str(entry.changefreq);
        xml.push_str("</changefreq>\n");
        xml.push_str("    <priority>");
        xml.push_str(entry.priority);
        xml.push_str("</priority>\n");
        xml.push_str("  </url>\n");
    }
    xml.push_str("</urlset>\n");
    xml
}

fn escape_xml(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

#[cfg(test)]
mod tests {
    use super::generate_sitemap;
    use std::path::Path;

    #[test]
    fn generates_sitemap_from_repository_pack() {
        let root = Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../..")
            .canonicalize()
            .unwrap_or_else(|err| panic!("workspace root should resolve: {err}"));
        if !root.join("RBackend/generated/api_items_en.fb").exists() {
            return;
        }
        let xml = generate_sitemap(&root, "https://example.test")
            .unwrap_or_else(|err| panic!("sitemap should generate: {err}"));

        assert!(xml.starts_with("<?xml"));
        assert!(xml.contains("<urlset"));
        assert!(xml.contains("https://example.test/items"));
        assert!(xml.contains("https://example.test/item/wooden-sword"));
    }
}

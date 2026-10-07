pub fn generate_robots(base_url: &str) -> String {
    let base = base_url.trim_end_matches('/');
    format!(
        "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /private/\nAllow: /images/\nAllow: /manifest.json\nSitemap: {base}/sitemap.xml\n"
    )
}

#[cfg(test)]
mod tests {
    use super::generate_robots;

    #[test]
    fn robots_points_to_sitemap() {
        let robots = generate_robots("https://example.test/");
        assert!(robots.contains("Sitemap: https://example.test/sitemap.xml"));
    }
}

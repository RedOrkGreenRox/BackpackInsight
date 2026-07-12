//! Per-IP rate limiter для `POST /api/profile.fb`.
//!
//! Паритет с Python `slowapi` 20/minute на `/api/profile`:
//! - token bucket per client IP;
//! - burst = `per_minute` (разрешаем всплеск до лимита в секунду);
//! - refill равномерно по `per_minute / 60` токенов в секунду;
//! - при превышении — `429 Too Many Requests` с FlatBuffer `ApiError` ("BIER"),
//!   code = `rate_limited`.

use crate::AppState;
use axum::{
    body::Body,
    extract::State,
    http::{header, HeaderMap, Request, StatusCode},
    middleware::Next,
    response::Response,
};
use pack::{build_api_error_bytes, ApiErrorPack};
use std::collections::HashMap;
use std::net::IpAddr;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct RateLimiter {
    inner: Arc<Mutex<HashMap<IpAddr, Bucket>>>,
    per_minute: u32,
    burst: u32,
}

impl std::fmt::Debug for RateLimiter {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("RateLimiter")
            .field("per_minute", &self.per_minute)
            .field("burst", &self.burst)
            .finish()
    }
}

struct Bucket {
    tokens: u32,
    last_refill: Instant,
}

impl RateLimiter {
    pub fn new(per_minute: u32) -> Self {
        Self {
            inner: Arc::new(Mutex::new(HashMap::new())),
            per_minute,
            burst: per_minute,
        }
    }

    pub async fn acquire(&self, ip: IpAddr) -> bool {
        let mut map = self.inner.lock().await;
        let now = Instant::now();
        let bucket = map.entry(ip).or_insert(Bucket {
            tokens: self.burst,
            last_refill: now,
        });
        let elapsed = now.duration_since(bucket.last_refill);
        let refill = tokens_for_elapsed(elapsed, self.per_minute);
        if refill > 0 {
            bucket.tokens = (bucket.tokens + refill).min(self.burst);
            bucket.last_refill = now;
        }
        if bucket.tokens > 0 {
            bucket.tokens -= 1;
            true
        } else {
            false
        }
    }
}

fn tokens_for_elapsed(elapsed: Duration, per_minute: u32) -> u32 {
    if per_minute == 0 {
        return 0;
    }
    let ms_per_token = 60_000u64.checked_div(per_minute as u64).unwrap_or(u64::MAX);
    let elapsed_ms = elapsed.as_millis() as u64;
    (elapsed_ms / ms_per_token) as u32
}

pub fn parse_rate_limit(raw: &str) -> Option<u32> {
    let trimmed = raw.trim().to_lowercase();
    if trimmed.is_empty() || trimmed == "0/minute" || trimmed == "0" {
        return None;
    }
    let digits = trimmed
        .chars()
        .take_while(|c| c.is_ascii_digit())
        .collect::<String>();
    digits.parse::<u32>().ok().filter(|n| *n > 0)
}

fn client_ip(headers: &HeaderMap) -> IpAddr {
    if let Some(value) = headers.get("x-forwarded-for") {
        if let Ok(s) = value.to_str() {
            if let Some(first) = s.split(',').next() {
                let first = first.trim();
                if let Ok(ip) = first.parse::<IpAddr>() {
                    return ip;
                }
            }
        }
    }
    if let Some(value) = headers.get("x-real-ip") {
        if let Ok(s) = value.to_str() {
            if let Ok(ip) = s.trim().parse::<IpAddr>() {
                return ip;
            }
        }
    }
    if let Some(value) = headers.get(header::FORWARDED) {
        if let Ok(s) = value.to_str() {
            for part in s.split(';') {
                let part = part.trim();
                if let Some(rest) = part.strip_prefix("for=") {
                    let candidate = rest.trim_matches(|c: char| c == '"' || c.is_whitespace());
                    if let Ok(ip) = candidate.parse::<IpAddr>() {
                        return ip;
                    }
                }
            }
        }
    }
    IpAddr::V4(std::net::Ipv4Addr::new(127, 0, 0, 1))
}

pub async fn rate_limit_profile(
    State(state): State<AppState>,
    request: Request<Body>,
    next: Next,
) -> Result<Response, (StatusCode, Response)> {
    let Some(limiter) = state.profile_rate_limiter.as_ref() else {
        return Ok(next.run(request).await);
    };
    let ip = client_ip(request.headers());
    if limiter.acquire(ip).await {
        Ok(next.run(request).await)
    } else {
        Err((StatusCode::TOO_MANY_REQUESTS, binary_rate_limit_error()))
    }
}

fn binary_rate_limit_error() -> Response {
    let bytes = build_api_error_bytes(&ApiErrorPack {
        code: "rate_limited".to_string(),
        detail: "Too many requests. Try again later.".to_string(),
        issues: Vec::new(),
    });
    let mut response = Response::new(Body::from(bytes));
    *response.status_mut() = StatusCode::TOO_MANY_REQUESTS;
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        header::HeaderValue::from_static("application/octet-stream"),
    );
    response.headers_mut().insert(
        header::RETRY_AFTER,
        header::HeaderValue::from_static("60"),
    );
    response
}

#[cfg(test)]
mod tests {
    use super::{parse_rate_limit, tokens_for_elapsed, RateLimiter};
    use std::net::Ipv4Addr;
    use std::time::{Duration, Instant};

    #[test]
    fn parse_rate_limit_accepts_common_forms() {
        assert_eq!(parse_rate_limit("20/minute"), Some(20));
        assert_eq!(parse_rate_limit("20/min"), Some(20));
        assert_eq!(parse_rate_limit("20/m"), Some(20));
        assert_eq!(parse_rate_limit("20"), Some(20));
        assert_eq!(parse_rate_limit("  30/minute  "), Some(30));
        assert_eq!(parse_rate_limit("0/minute"), None);
        assert_eq!(parse_rate_limit("0"), None);
        assert_eq!(parse_rate_limit(""), None);
        assert_eq!(parse_rate_limit("abc"), None);
    }

    #[test]
    fn tokens_for_elapsed_refills_proportionally() {
        assert_eq!(tokens_for_elapsed(Duration::from_millis(0), 20), 0);
        assert_eq!(tokens_for_elapsed(Duration::from_millis(2999), 20), 0);
        assert_eq!(tokens_for_elapsed(Duration::from_millis(3000), 20), 1);
        assert_eq!(tokens_for_elapsed(Duration::from_millis(6000), 20), 2);
        assert_eq!(tokens_for_elapsed(Duration::from_secs(60), 20), 20);
        assert_eq!(tokens_for_elapsed(Duration::from_secs(120), 20), 40);
    }

    #[test]
    fn tokens_for_elapsed_zero_per_minute_is_zero() {
        assert_eq!(tokens_for_elapsed(Duration::from_secs(9999), 0), 0);
    }

    #[tokio::test]
    async fn limiter_allows_burst_then_blocks() {
        let limiter = RateLimiter::new(3);
        let ip: std::net::IpAddr = std::net::IpAddr::V4(Ipv4Addr::new(1, 2, 3, 4));
        assert!(limiter.acquire(ip).await, "burst #1");
        assert!(limiter.acquire(ip).await, "burst #2");
        assert!(limiter.acquire(ip).await, "burst #3");
        assert!(!limiter.acquire(ip).await, "should be blocked after burst");
    }

    #[tokio::test]
    async fn limiter_refills_over_time() {
        let limiter = RateLimiter::new(60);
        let ip: std::net::IpAddr = std::net::IpAddr::V4(Ipv4Addr::new(9, 9, 9, 9));
        for _ in 0..60 {
            assert!(limiter.acquire(ip).await);
        }
        assert!(!limiter.acquire(ip).await, "bucket exhausted");
        assert!(!limiter.acquire(ip).await, "no time elapsed, still empty");
        {
            let mut map = limiter.inner.lock().await;
            let bucket = map
                .get_mut(&ip)
                .unwrap_or_else(|| panic!("bucket for {ip} should exist after acquire"));
            bucket.last_refill = Instant::now() - Duration::from_secs(2);
        }
        assert!(limiter.acquire(ip).await, "1 token refilled");
        assert!(limiter.acquire(ip).await, "2nd token refilled");
        assert!(!limiter.acquire(ip).await, "3rd not yet");
    }

    #[tokio::test]
    async fn limiter_tracks_ips_independently() {
        let limiter = RateLimiter::new(1);
        let ip1: std::net::IpAddr = std::net::IpAddr::V4(Ipv4Addr::new(1, 1, 1, 1));
        let ip2: std::net::IpAddr = std::net::IpAddr::V4(Ipv4Addr::new(2, 2, 2, 2));
        assert!(limiter.acquire(ip1).await, "ip1 first");
        assert!(!limiter.acquire(ip1).await, "ip1 exhausted");
        assert!(limiter.acquire(ip2).await, "ip2 independent");
    }
}

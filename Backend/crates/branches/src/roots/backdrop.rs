//! Фон страницы (перенос `Shell.setRandomBackground` и 404-`BackgroundManager`).
//!
//! При первой загрузке фон случайный, как в TS-версии. При переходах через
//! islands router сервер берёт тот же фон из cookie, поэтому картинка не меняется.
//! У 404 свои пять фонов «по редкости»; при смене языка на 404 редкость сохраняется.

use super::BranchCtx;
use std::hash::{BuildHasher, Hasher};

/// Cookie с номером обычного фона (`01`–`20`).
const AREA_COOKIE: &str = "bi_bg";
/// Cookie с редкостью фона 404 (`00`–`04`).
const RARITY_COOKIE: &str = "bi_bg404";
/// Сколько обычных фонов.
const AREAS: u64 = 20;
/// Пороги редкости 404 в десятых долях процента: 80 % / 15 % / 4 % / 0,9 % / 0,1 %.
const RARITY_THRESHOLDS: [(u64, &str); 4] = [(999, "04"), (990, "03"), (950, "02"), (800, "01")];

/// Пара путей к картинке фона.
pub struct Backdrop {
    /// Картинка AVIF.
    pub avif: String,
    /// Запасная картинка WebP.
    pub webp: String,
}

impl Backdrop {
    /// Фон для страницы; `not_found` — страница 404.
    #[must_use]
    pub fn choose(ctx: &BranchCtx, not_found: bool) -> Self {
        if not_found {
            let keep = ctx.navigation && ctx.query("lang").is_some();
            let code = reuse(ctx, RARITY_COOKIE, keep, |c| c.len() == 2 && c <= "04")
                .unwrap_or_else(|| random_rarity().to_string());
            ctx.remember(RARITY_COOKIE, &code);
            return Self::at("404", &code);
        }
        let code = reuse(ctx, AREA_COOKIE, ctx.navigation, |c| {
            c.parse::<u64>().is_ok_and(|n| (1..=AREAS).contains(&n))
        })
        .unwrap_or_else(|| format!("{:02}", random() % AREAS + 1));
        ctx.remember(AREA_COOKIE, &code);
        Self::at("area", &format!("area{code}"))
    }

    fn at(dir: &str, name: &str) -> Self {
        Self {
            avif: format!("/images/{dir}/avif/{name}.avif"),
            webp: format!("/images/{dir}/webp/{name}.webp"),
        }
    }
}

/// Значение из cookie, если его можно переиспользовать и оно корректно.
fn reuse(
    ctx: &BranchCtx,
    cookie: &str,
    keep: bool,
    valid: impl Fn(&str) -> bool,
) -> Option<String> {
    keep.then(|| ctx.cookie(cookie))
        .flatten()
        .filter(|code| valid(code))
        .map(str::to_string)
}

/// Редкость фона 404 с весами из TS-версии.
fn random_rarity() -> &'static str {
    let roll = random() % 1000;
    RARITY_THRESHOLDS
        .iter()
        .find(|(threshold, _)| roll >= *threshold)
        .map_or("00", |(_, code)| code)
}

/// Случайное число без внешних зависимостей: `RandomState` засевается ОС.
fn random() -> u64 {
    std::collections::hash_map::RandomState::new()
        .build_hasher()
        .finish()
}

#[cfg(test)]
mod tests {
    use super::{random_rarity, RARITY_THRESHOLDS};

    #[test]
    fn rarity_codes_are_known() {
        for _ in 0..200 {
            assert!(["00", "01", "02", "03", "04"].contains(&random_rarity()));
        }
        assert!(RARITY_THRESHOLDS.windows(2).all(|w| w[0].0 > w[1].0));
    }
}

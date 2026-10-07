# [Ограничение частоты по IP (rate_limit.rs)](/RBackend/crates/api/src/security/rate_limit.rs)

## Назначение
Ограничение частоты по IP для `POST /api/profile.fb` — замена лимитера slowapi «20/minute» из старого Python-бэкенда. Алгоритм — token bucket: у каждого IP своё ведро.

## API
- `RateLimiter` — словарь IP → ведро за `Arc<Mutex<…>>` (tokio), плюс `per_minute` и `burst` (равен `per_minute`). Ручной `Debug` печатает только числа.
- `RateLimiter::new(per_minute)` — пустой лимитер.
- `acquire(ip)` — новое ведро начинается полным. Сначала досыпаются токены за прошедшее время (не выше `burst`), затем, если токен есть, он списывается и возвращается `true`.
- `parse_rate_limit(raw)` — берёт ведущие цифры из строк вида `20/minute`, `20/min`, `20`; пустое значение, ноль и строка без цифр дают `None`. Единица времени после `/` не читается — всегда «в минуту».
- `rate_limit_profile` — слой Axum: без лимитера в состоянии пропускает запрос, иначе при отказе отвечает 429.

## Внутреннее
- `Bucket` — `tokens` и `last_refill`.
- `tokens_for_elapsed(elapsed, per_minute)` — целое число токенов за прошедшие миллисекунды при шаге `60000 / per_minute` мс; при нуле в минуту — 0.
- `client_ip(headers)` — первый адрес из `x-forwarded-for`, затем `x-real-ip`, затем `for=` в стандартном заголовке Forwarded; если ничего не разобрано — `127.0.0.1`. Адрес TCP-соединения не используется, поэтому без прокси все клиенты делят одно ведро.
- `binary_rate_limit_error()` — пак ошибки (`code` = `rate_limited`) с `content-type: application/octet-stream` и `Retry-After: 60`.

Вёдра не удаляются: словарь растёт с числом уникальных IP за время жизни процесса.

## Тесты
`parse_rate_limit_accepts_common_forms`, `tokens_for_elapsed_refills_proportionally`, `tokens_for_elapsed_zero_per_minute_is_zero`, `limiter_allows_burst_then_blocks`, `limiter_refills_over_time`, `limiter_tracks_ips_independently`.

## Связи
Создаётся в [state](../state.md), подключается в [lib](../lib.md); ошибка строится через [pack/error](../../../pack/src/error.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

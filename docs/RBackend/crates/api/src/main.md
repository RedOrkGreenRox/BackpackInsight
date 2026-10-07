# [Точка входа сервера (main.rs)](/RBackend/crates/api/src/main.rs)

## Назначение
Бинарная точка входа crate `api` (`#[tokio::main]`).

## Что делает `main`
1. Настраивает `tracing_subscriber` с фильтром `EnvFilter::try_from_default_env()` — то есть из стандартной переменной фильтра логов tracing; если она не задана или некорректна, используется уровень `info`.
2. Читает адрес из `ROOT_API_ADDR`; если переменной нет или она не парсится в `SocketAddr`, слушает `127.0.0.1:8090`.
3. Пишет в лог `starting Backpack Insight API` и вызывает `api::serve(addr)` из [lib](lib.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

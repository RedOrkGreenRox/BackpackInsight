# [api/main.rs](/RBackend/crates/api/src/main.rs)

## Назначение
Бинарная точка входа `api` crate (`#[tokio::main]`). Инициализирует `tracing_subscriber`, читает `ROOT_API_ADDR` (по умолчанию `127.0.0.1:8090`) и вызывает `api::serve(addr)`.

## Ключевая функциональность
- `EnvFilter` из `RUST_LOG` (fallback `info`).
- Адрес слушателя из `ROOT_API_ADDR`.

## Связи
- Делегирует в [lib.rs](lib.md) → `api::serve`.

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.

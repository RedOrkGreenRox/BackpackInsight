# [Docker-образ Rust-бэкенда (Dockerfile)](/Backend/Dockerfile)

## Назначение
Многоэтапная сборка Rust-бэкенда `Backend/` в production-образ. Builder собирает `api` crate и генерирует FlatBuffer-паки, runtime запускает только бинарник `api` + сгенерированные .fb-файлы.

## Этапы

### 1. Builder (`rust:1.97-bookworm`)
- Устанавливает `flatbuffers-compiler` (для `flatc`).
- Копирует `Backend/` (вместе с выгрузками `Backend/data/`), `tests/`, `Frontend/Web/static/images/items/`.
- Запускает последовательно:
  - `cargo test --workspace` — все unit-тесты.
  - `cargo run --release -p builder -- validate-all` — валидация каталога.
  - `cargo run --release -p builder -- build-all-packs` — сборка `Backend/generated/*.fb` и каталога `items_{en,ru}.json`.
  - `cargo run --release -p builder -- verify-all-packs` — проверка паков.
  - `cargo build --release -p api` — компиляция `api` binary.

### 2. Runtime (`debian:bookworm-slim`)
- Копирует `target/release/api` + `Backend/generated/`.
- Env: `ROOT_PROJECT_ROOT=/app`, `ROOT_ENV=production`, `ROOT_API_ADDR=0.0.0.0:8000`.
- `EXPOSE 8000`, `CMD ["/app/api"]`.

## Связи
- Backend workspace: [Backend index](index.md).
- Builder: [builder crate](crates/build.md).
- API: [api crate](crates/api.md).
- Frontend Dockerfile: [Frontend/Dockerfile.md](../Frontend/Dockerfile.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.

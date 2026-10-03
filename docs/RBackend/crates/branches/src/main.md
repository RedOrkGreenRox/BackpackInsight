# [branches/main.rs](/RBackend/crates/branches/src/main.rs)

## Назначение
Бинарник `branches`: SSR-сайт Backpack Insight на Leptos + Axum. Собирается только с фичей `ssr` (`required-features` в `Cargo.toml` крейта).

## Ключевая функциональность
- **`main()`** (`#[tokio::main]`, многопоточный рантайм):
  1. настраивает `tracing_subscriber`: фильтр из переменной окружения RUST_LOG (`EnvFilter::try_from_default_env`), по умолчанию `info`;
  2. передаёт управление `BranchRunner::serve` ([runner.rs](roots/runner.md)) и возвращает его ошибку как `Box<dyn Error>`.

Вся конфигурация (адрес, каталог `pkg`, корень проекта) читается внутри `serve`; сам `main` ничего не знает о маршрутах.

## Запуск
Команды сборки и переменные окружения — в разделе «Сборка и запуск» [обзора крейта](../../branches.md).

## Связи
- Библиотека, которую вызывает бинарник: [lib.rs](lib.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.

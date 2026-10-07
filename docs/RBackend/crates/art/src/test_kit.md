# [Временный ContentKit для тестов (test_kit.rs)](/RBackend/crates/art/src/test_kit.rs)

## Назначение
Временный ContentKit для тестов (только `cfg(test)`): папка в `temp_dir` с уникальным именем, удаляется в `Drop`.

## API
- **`TestKit::new()`**, **`png(rel, w, h, color)`** — PNG одного цвета по пути внутри архива, **`path()`**.

## Связи
- Используется в [resolve_tests.rs](resolve_tests.md) и [render_tests.rs](render_tests.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06

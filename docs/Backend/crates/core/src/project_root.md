# [Поиск корня проекта (project_root.rs)](/Backend/crates/core/src/project_root.rs)

## Назначение
Одно правило поиска корня репозитория для всех бинарников: `builder`, `cli` и `api` (а через него и сайт `branches`). Корень — первый каталог вверх от старта, в котором есть файл `Backend/Cargo.toml`.

## API
- `PROJECT_ROOT_MARKER` — `"Backend/Cargo.toml"`, признак корня.
- `find_project_root()` — поиск вверх от текущего каталога процесса.
- `find_project_root_from(start)` — то же от заданного каталога (сам `start` тоже проверяется). Ошибка `could not find project root with Backend/Cargo.toml above <start>`, если признака нет до корня ФС.

## Кто вызывает
- [builder/main](../../builder/src/main.md) и [cli/main](../../cli/src/main.md) — напрямую.
- [api/state](../../api/src/state.md) — если не задан `ROOT_PROJECT_ROOT` (в Docker-образе он задан, там `Cargo.toml` нет).

## Тесты
- `finds_repo_root_from_crate_dir` — от каталога крейта находится корень с `Backend/Cargo.toml`.
- `fails_without_marker` — от `/` поиск возвращает ошибку.

---

> 📌 **Подпись документации:** по исходнику · 2026-10-07

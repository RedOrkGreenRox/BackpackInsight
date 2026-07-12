# [builder/root.rs](/RBackend/crates/builder/src/root.rs)

## Назначение
Обнаружение корня проекта для `builder`: `find_project_root()` поднимается по дереву каталогов, ища `RBackend/` или `Backend/DB`+`Frontend/Web`.

## Ключевая функциональность
- `find_project_root()` → `Result<PathBuf, String>`.

---

> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.

# [style/branches/editor/_layout.scss](/RBackend/crates/branches/style/branches/editor/_layout.scss)

## Назначение
Раскладка редактора: на широком экране (от 64rem) каталог слева, поле со складом справа; на узком — сверху вниз, как в игре.

## Ключевая функциональность
- `.ed-editor`: `--field-cell` (клетка поля, `clamp(2.25rem, (100vw − отступы) / 9, 4.25rem)`) и `--cell`.
- `.ed-board`, `.ed-heading`, `.ed-hint`, `.ed-button` (`.ed-on` — включённый режим), `.ed-dragging` (без выделения текста и прокрутки пальцем).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

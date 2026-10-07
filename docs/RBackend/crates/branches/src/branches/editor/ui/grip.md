# [Ручка размера (grip.rs)](/RBackend/crates/branches/src/branches/editor/ui/grip.rs)

## Назначение
`Grip(value, current, per_px, min, max, label, class)` — край поля или каталога, который тянут мышью вниз и вверх (идея Ивана; только ПК: на сенсорных экранах [_panels.scss](../../../../style/branches/editor/_panels.md) прячет `.ed-grip`).

## Ключевая функциональность
- Нажатие захватывает указатель (`capture`, [dom.rs](dom.md)) и запоминает начало; движение ставит `value` = начальное + сдвиг × `per_px` в границах `min`..`max`. Начальное значение — `value` или, если оно ещё `None`, `current` (меряется на странице).
- Двойной щелчок — `value` = `None` (размер по экрану). Стрелки вверх/вниз меняют значение шагом `KEY_STEP` пикселей; роль `separator` с подписью `label`.
- Использование: клетка поля ([field.rs](field.md), `Editor::field_cell`), высота списка каталога ([palette.rs](palette.md), `Editor::catalog_height`). Значения запоминаются в браузере ([manager.rs](manager.md)).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

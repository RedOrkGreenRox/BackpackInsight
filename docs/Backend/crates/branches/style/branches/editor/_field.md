# [Стили поля редактора (_field.scss)](/Backend/crates/branches/style/branches/editor/_field.scss)

## Назначение
Поле 9 × 6 и его слои: `.ed-frame` (рамка с каменной сеткой из игры, `images/editor/inventory`; отступы — толщина рамки в клетках, чтобы сетка фона совпала с клетками поля), `.ed-frame-bags` (оранжевая сетка режима сумок, `images/editor/inventory-bag-mode`), `.ed-field`, `.ed-layer`, `.ed-piece`, `.ed-art` (картинка по центру, поворот — инлайн), `.ed-ghosted` (режим сумок), отметки `.ed-mark-fits` / `.ed-mark-blocked` / `.ed-mark-star` (★) и `.ed-ghost` (предмет под указателем, `position: fixed`). Кнопка «i» в углу рамки и её подсказка — `.ed-info`, `.ed-info-text`; ручка размера по нижнему краю рамки — `.ed-grip-field`. Картинки рамки делает [scripts/editor_ui_art.py](/docs/scripts/editor_ui_art.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

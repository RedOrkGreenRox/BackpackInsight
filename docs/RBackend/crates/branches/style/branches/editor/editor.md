# [style/branches/editor/_editor.scss](/RBackend/crates/branches/style/branches/editor/_editor.scss)

## Назначение
Точка входа стилей редактора; подключается в [site.scss](../../site.md) внутри `main[data-branch="EditorBranch"]`. Классы острова начинаются с `ed-`. Размеры — только `rem`, `vw`, `clamp` и токены ([_tokens.scss](../../roots/_roots/_tokens.md)), по правилу Ивана без жёстких пикселей.

## Ключевая функциональность
`@use` четырёх частей: [_layout.scss](_layout.md), [_field.scss](_field.md), [_panels.scss](_panels.md), [_dialog.scss](_dialog.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

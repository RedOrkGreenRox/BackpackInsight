# [utils/SecurityService.ts](/Frontend/Web/ground/utils/SecurityService.ts)

## Назначение
`SecurityService` — утилиты безопасности: защита от XSS, очистка HTML.

## Ключевая функциональность
- `SecurityService.escapeHtml(str)` — экранирование `&`/`<`/`>`/`"`/`'`/`` ` ``.
- Статические методы, pure functions.

## Связи
- Используется в рендерерах, которые инжектят user-supplied строки (поиск, фильтры, тултипы).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.

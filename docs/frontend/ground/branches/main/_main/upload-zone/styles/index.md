# [Barrel стилей зоны (index.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/styles/index.scss)

## Назначение
Агрегатор стилей области загрузки `.upload-area`. Подключает части через `@use` в порядке каскада.

## Подключения
*   `@use "upload-area-base"` — [база](upload-area-base.md).
*   `@use "upload-area-hover"` — [hover/drag-over](upload-area-hover.md).
*   `@use "upload-area-user-select"` — [выделение/перетаскивание](upload-area-user-select.md).
*   `@use "upload-area-textarea"` — [текстовое поле](upload-area-textarea.md).
*   `@use "upload-area-responsive"` — [адаптив](upload-area-responsive.md).

## AI-контекст
*   Порядок `@use` задаёт каскад: база → интерактив → поле → адаптив.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

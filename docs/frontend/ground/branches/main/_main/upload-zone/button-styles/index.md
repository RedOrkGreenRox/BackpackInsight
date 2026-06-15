# [Barrel стилей кнопки (index.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/button-styles/index.scss)

## Назначение
Агрегатор стилей кнопки `.button-view-profile`. Собственных правил нет — подключает части через `@use` в порядке каскада.

## Подключения
*   `@use "button-base"` — [база](button-base.md).
*   `@use "button-states"` — [состояния](button-states.md).
*   `@use "button-responsive"` — [адаптив](button-responsive.md).

## AI-контекст
*   Порядок важен: база → состояния → адаптив. Новые части кнопки подключайте здесь, не правьте инлайн.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

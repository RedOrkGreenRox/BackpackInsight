# [Скрытые элементы (visually-hidden.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/zone-styles/visually-hidden.scss)

## Назначение
Утилитарный класс `.visually-hidden` для «честного» скрытия элементов (например, `input[type=file]`): невидим визуально, но доступен скринридерам и кликам по `<label>`.

## Задаваемые стили

### `.visually-hidden` (все свойства с `!important`)
*   `position: absolute`.
*   Микро-размер: `width:1px; height:1px; padding:0; margin:-1px`.
*   `overflow: hidden`; `clip: rect(0,0,0,0)` — обрезает содержимое в точку.
*   `white-space: nowrap`; `border:0`.

## AI-контекст
*   Это стандартный паттерн доступности (a11y). НЕ заменяйте на `display:none`/`visibility:hidden` — они убирают элемент из дерева доступности и ломают нативный выбор файла через `<label>`.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).

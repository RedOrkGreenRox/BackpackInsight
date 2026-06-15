# [Базовая кнопка загрузки (button-base.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/button-styles/button-base.scss)

## Назначение
Базовые стили кнопки `.button-view-profile` («показать профиль») в стиле Glass UI. Состояния и адаптив вынесены в соседние файлы [button-states](button-states.md) и [button-responsive](button-responsive.md).

## Задаваемые стили

### `.button-view-profile`
*   Размер: `width:100%; padding:22px; font-size:1.5em`.
*   Раскладка контента: `display:flex; justify-content:center; align-items:center; gap:15px`.
*   Glass UI: `background: rgba(0,0,0,0.5)`; `border: 2px solid rgba(255,255,255,0.25)`; `border-radius:50px`.
*   Типографика: `color:#fff; font-weight:800; text-transform:uppercase; letter-spacing:1px`; `text-shadow:0 2px 4px rgba(0,0,0,0.9)`.
*   Объём/поведение: `box-shadow:0 5px 15px rgba(0,0,0,0.4)`; `cursor:pointer`; `transition: all 0.2s ease-out`; `position:relative; overflow:hidden` (под эффекты вспышки).

## AI-контекст
*   Стиль намеренно совпадает с кнопкой скачивания профиля ([_button-download](../../../../profile/_profile/button-download/_button-download.md)) — единый визуальный язык Glass UI.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).

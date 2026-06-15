# [Базовая подсказка загрузки (upload-hint-base.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/hint-styles/upload-hint-base.scss)

## Назначение
Стили текстовой подсказки `.upload-hint` («перетащите файл / вставьте JSON»), наложенной поверх зоны загрузки.

## Задаваемые стили

### `.upload-hint`
*   Позиционирование: `position:absolute; z-index:1` (поверх зоны, под текстовым полем `z-index:5`).
*   Раскладка: `display:flex; flex-direction:column; align-items:center; gap:15px`.
*   Текст: `color: rgba(255,255,255,0.9)`; `text-align:center`; `font-size:1.5rem; font-weight:600`; `text-shadow:0 2px 4px rgba(0,0,0,0.8)`.
*   `pointer-events: none` — подсказка не перехватывает клики (они идут на зону/textarea).

### Вложенные элементы
*   `i` (иконка): `font-size:3rem; opacity:0.8; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5))`.
*   `p`: `margin:0; line-height:1.4`.

## AI-контекст
*   `pointer-events:none` критичен: без него подсказка перекрывала бы клики по зоне загрузки.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).

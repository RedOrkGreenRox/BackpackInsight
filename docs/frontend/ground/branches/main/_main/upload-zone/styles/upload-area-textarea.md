# [Текстовое поле загрузки (upload-area-textarea.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/styles/upload-area-textarea.scss)

## Назначение
Стили `textarea` внутри `.upload-area` — прозрачного поля на весь размер зоны для ручной вставки JSON.

## Задаваемые стили

### `.upload-area textarea`
*   Растяжка на всю зону: `position:absolute; top:0; left:0; width:100%; height:100%`.
*   Прозрачность: `background: transparent; border:none; outline:none`.
*   Текст: `color: var(--text-default-color)`; `font-family:'Courier New', monospace`; `font-size:18px; line-height:1.5`; `text-shadow:0 1px 2px rgba(0,0,0,0.8)`.
*   `padding:25px`; `resize:none`; `z-index:5` (над подсказкой `.upload-hint`).

## AI-контекст
*   Моноширинный шрифт выбран намеренно — JSON удобнее читать/редактировать. `z-index:5` держит поле выше подсказки.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).

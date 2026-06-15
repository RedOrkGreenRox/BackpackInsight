# [Название предмета (_item-name.scss)](../../../../../../Frontend/Web/ground/roots/_roots/items/_item-name.scss)

## Назначение
Стили названия предмета `.item-name` в карточке с обрезкой в 2 строки.

## Задаваемые стили
### `.item-name`
*   `font-size:0.9rem; color:#e0e0e0; text-align:center; line-height:1.2; font-weight:500`.
*   Обрезка: `display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden` (максимум 2 строки с многоточием).
*   Адаптив `≤480px`: `font-size:0.8rem`.

## AI-контекст
*   `-webkit-line-clamp:2` ограничивает длинные имена двумя строками — важно для ровной высоты карточек в сетке.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

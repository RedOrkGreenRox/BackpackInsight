# [Раскладка страницы предметов (_layout.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/layout/_layout.scss)

## Назначение
Стили секции-обёртки `.wiki-section`, шапки `.wiki-header`, главного заголовка `.main-title` и подзаголовка `.wiki-subtitle` страницы списка предметов.

## Задаваемые стили
### `.wiki-section`
*   `padding: clamp(80px,15vh,120px) 20px 40px; min-height:100vh` — верхний отступ под фикс. шапку.
### `.wiki-header`
*   `margin-bottom:40px; text-align:center`.
### `.main-title`
*   `font-size:3rem; color:white; margin-bottom:10px; text-shadow:0 4px 10px rgba(0,0,0,0.5)`.
### `.wiki-subtitle`
*   `color: rgba(255,255,255,0.7); font-size:1.2rem; margin-top:10px`.

## AI-контекст
*   Адаптив заголовка/подзаголовка — в [_tablet](../responsive/_tablet.md). `.main-title` здесь локальный для страницы предметов (тёзка заголовка главной, но другой контекст).

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

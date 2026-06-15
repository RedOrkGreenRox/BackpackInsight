# [Стили переключателя языков (_lang-switcher.scss)](../../../../../../../Frontend/Web/ground/roots/_roots/shell/sidebar/_lang-switcher.scss)

## Назначение
Стили кнопки `#lang-switcher` (переключатель языка) внизу сайдбара — с учётом safe-area, множества брейкпоинтов, режима экономии ресурсов и анимации появления.

## Связи (Dependencies)
*   [Сайдбар](_sidebar.md): кнопка живёт внутри `.sidebar` и анимируется при его открытии.
*   [Локализация (i18n)](../../../../localization/i18n.md): логика самого переключения языка.

## Задаваемые стили

### `#lang-switcher` (база)
*   Позиционирование: `position:absolute; bottom: max(20px, env(safe-area-inset-bottom,20px)); left:50%; transform: translateX(-50%)` — по центру внизу с учётом «чёлки»/home-indicator.
*   Адаптивные размеры: `padding: clamp(8px,2vw,12px) clamp(16px,4vw,24px)`; `font-size: clamp(12px,3vw,14px); font-weight:500`.
*   Стекло: `background: rgba(255,255,255,0.1)` (с solid-fallback `#2a2a3e` для контраст-чекеров); `border:1px solid rgba(255,255,255,0.2)`; `border-radius:20px`; `backdrop-filter: blur(10px)` (+ `-webkit-`).
*   `color:white; cursor:pointer; z-index:1060; white-space:nowrap; user-select:none; transition: all 0.3s ease`.

### Состояния
*   `&:hover`: подсветка фона/рамки + `transform: translateX(-50%) scale(1.05)`.
*   `&:active`: `transform: translateX(-50%) scale(0.95)`.

### Адаптивность (множество `@media`)
*   `≤768px`: больше `bottom`, `min-height:44px`/`min-width:80px` (touch-target); вложенно `≤600px` по высоте — компактнее; `@supports (padding:max())` — коррекция под iPhone home-indicator.
*   `≤360px`: компактный padding/шрифт.
*   Планшеты `769–1024px` (portrait) и мобильный landscape — отдельные коррекции `bottom`/размеров.

### Режим экономии и анимация
*   `.low-res-mode &`: отключает `backdrop-filter`, ставит плотный фон `rgba(0,0,0,0.7)`.
*   `.sidebar.open &`: запускает `@keyframes slideUpFadeIn` (всплытие снизу с прозрачностью, 0.4s, с задержкой 0.3s).

## AI-контекст
*   Это самый «адаптивный» атом проекта: правки размеров нужно проверять во всех брейкпоинтах и с safe-area. `--low-res-mode` обязан отключать blur ради производительности.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).

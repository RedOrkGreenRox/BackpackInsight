# Frontend practices gap analysis — часть 2

Начало (пункты 1–6): [часть 1](frontend_practices_gap_analysis.md).

## 7. Polyfills

Текущее состояние: системных polyfills нет, есть локальные fallback-и.

Плюсы аккуратного введения:

- можно поддержать выбранный browser matrix без ручных костылей;
- меньше скрытых runtime ошибок в старых браузерах.

Минусы:

- лишний вес;
- часто не нужен при современной browser target matrix.

Рекомендация: не добавлять глобальные polyfills заранее. Использовать feature detection + tiny targeted fallback only.

Приоритет: низкий-средний.

## 8. Кроссбраузерное тестирование

Текущее состояние: BrowserStack нет, Playwright не используется как полноценный cross-browser suite.

Плюсы введения:

- ловит Safari/iOS issues, особенно file input, clipboard, download, CSS backdrop/filter;
- важно для profile upload и screenshot/export;
- снижает риск production bugs, которые агент не увидит в Chromium.

Рекомендация: сначала Playwright Chromium/WebKit/Firefox локально/CI. BrowserStack — позже, если нужен real-device matrix.

Приоритет: высокий для upload/profile/screenshot функционала.

## 9. Feature Queries / `@supports`

Текущее состояние: найдено только минимальное использование `@supports`.

Плюсы введения:

- безопасное использование новых CSS-фич;
- graceful fallback для container queries, backdrop-filter, color-mix, advanced selectors;
- меньше browser-specific JS.

Рекомендация: использовать для новых progressive CSS-фич, особенно в SSR/islands переходе.

Приоритет: средний.

## 10. SVG вместо raster там, где это уместно

Текущее состояние: есть inline SVG favicon; основная графика AVIF/WebP/PNG.

Плюсы введения:

- меньше вес для простых иконок/UI glyphs;
- проще theme/color через CSS;
- лучше масштабирование;
- меньше нужды в нескольких raster-размерах.

Где уместно:

```text
UI icons
navigation icons
simple status icons
filter icons if не игровая пиксельная графика
```

Где не стоит:

```text
item art
hero art
area backgrounds
скриншоты
```

Приоритет: средний.

## 11. Container Queries

Текущее состояние: не используются.

Плюсы введения:

- компоненты становятся адаптивными от собственного контейнера, а не от viewport;
- особенно полезно для карточек, grids, sidebar, profile header;
- лучше сочетается с islands и SSR-компонентами;
- меньше глобальных media-query костылей.

Рекомендация: вводить точечно, начиная с reusable cards/grids. Обязательно с fallback через обычные media queries или `@supports`.

Приоритет: средний-высокий после стабилизации SSR component tree.

## 12. W3C / HTML / CSS validation

Текущее состояние: явной валидации нет.

Плюсы введения:

- ловит битую HTML-структуру SSR;
- полезно при генерации HTML из Leptos/SSR/templates;
- защищает SEO/OG/JSON-LD/head tags;
- агент получает формальный сигнал, а не ручную проверку.

Рекомендация:

```text
html-validate или аналог для generated SSR snapshots
JSON-LD validation для item pages
link/canonical/hreflang checks
```

Приоритет: высокий перед SSR rollout.

---

## Итоговый приоритет

Высокий:

```text
visual regression tests
graceful degradation
progressive enhancement
cross-browser Playwright
HTML/SSR validation
```

Средний-высокий:

```text
autoprefixer/lightningcss
container queries
feature queries
```

Средний:

```text
relative unit discipline
SVG for UI icons
modern reset normalization
```

Низкий-средний:

```text
global polyfills
BrowserStack before real need
```

---

> 📌 **Подпись документации:** анализ пользы внедрения отсутствующих/частичных frontend-практик, 2026-07-06.

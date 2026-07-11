# Frontend practices gap analysis — что стоит добавить позже

Этот файл фиксирует практики из аудита старого frontend, которые сейчас отсутствуют или используются частично, и пользу от их введения в будущей корневой архитектуре.

## 1. Normalize.css / modern-normalize поверх текущего reset

Текущее состояние: есть собственный CSS reset, но нет `normalize.css` / `modern-normalize`.

Плюсы введения:

- меньше различий дефолтных стилей между браузерами;
- меньше ручных reset-исключений;
- лучше предсказуемость SSR HTML до гидрации islands;
- проще визуальные snapshot-тесты, потому что baseline браузеров стабильнее.

Рекомендация: не обязательно тащить библиотеку как runtime-зависимость. Можно взять минимальный modern reset как исходный SCSS/CSS слой и держать его в `Shell`/`roots`.

Приоритет: средний.

## 2. Визуальное тестирование

Текущее состояние: Playwright есть в devDependencies, но полноценного visual regression suite нет.

Плюсы введения:

- ловит «поехала карточка», что компилятор Rust/TypeScript не поймает;
- защищает дендрическую UI-структуру при рефакторинге;
- особенно важно при переходе на Leptos SSR/islands, где возможны hydration/layout regressions;
- полезно для агента: изменение визуала становится явным diff-артефактом.

Рекомендация:

```text
/ desktop/mobile
/items first screen + filters open
/item/:slug
/profile synthetic fixture
/404
ru/en
low-res mode
```

Приоритет: высокий перед большим frontend rewrite.

## 3. Autoprefixer / Lightning CSS / browserslist

Текущее состояние: автопрефиксеры не настроены; есть отдельные ручные префиксы.

Плюсы введения:

- меньше ручных `-webkit-*` исключений;
- централизованная политика поддержки браузеров;
- лучше кроссбраузерность CSS Grid/Flex/backdrop/filter;
- можно использовать Lightning CSS как минификатор и трансформер в новом Rust/Trunk/cargo pipeline.

Рекомендация: в новой системе предпочесть `Lightning CSS` или эквивалентный post-step, плюс явный `browserslist`/target matrix.

Приоритет: средний-высокий.

## 4. Более системные относительные единицы

Текущее состояние: `rem`, `%`, `vh/vw`, `clamp()` используются, но много `px`.

Плюсы введения:

- лучше масштабирование под разные DPI и accessibility zoom;
- меньше media-query точек;
- лучше SSR-first layout без client измерений;
- проще responsive behavior в visual tests.

Рекомендация: не запрещать `px` полностью. Для spacing/font/layout ввести design tokens через CSS custom properties и `clamp()`.

Приоритет: средний.

## 5. Graceful Degradation

Текущее состояние: частично есть — image fallback, low-res mode, service worker fallback.

Плюсы усиления:

- сайт остаётся работоспособным без WASM island;
- SSR pages полезны даже при ошибке client hydration;
- важно для медленных устройств и плохой сети;
- снижает риск «белого экрана».

Рекомендация для Rust SSR/islands:

```text
HTML first
CSS first
islands optional
forms degrade to server submit where возможно
search starts as basic SSR/list before rich island
```

Приоритет: высокий.

## 6. Progressive Enhancement

Текущее состояние: частично есть — service worker optional, AVIF/WebP detection, requestIdle fallback.

Плюсы усиления:

- islands можно грузить после first paint;
- сложный поиск и фильтры становятся enhancement, а не условием отображения страницы;
- улучшает perceived performance;
- упрощает SEO и доступность.

Рекомендация: новая Leptos-архитектура должна быть progressive by default: SSR shell работает без WASM, islands только улучшают.

Приоритет: высокий.

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

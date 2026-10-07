# Чего не хватает фронтенду, часть 1

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

Продолжение (пункты 7–12 и итоговый приоритет): [часть 2](frontend_practices_gap_analysis_2.md).

---

> 📌 **Подпись документации:** анализ пользы внедрения отсутствующих/частичных frontend-практик, 2026-07-06.

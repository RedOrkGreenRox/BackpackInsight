# [Переходы между страницами (_page-transitions.scss)](/RBackend/crates/branches/style/roots/_roots/shell/navigation/_page-transitions.scss)

## Назначение
Плавные переходы между страницами вместо `#app.fade-out` и библиотеки AOS из TS-версии. Длительности и размытие — из токенов [_tokens.scss](../../_tokens.md).

## Содержимое
1. **`#app`** плавно меняет прозрачность (`--dur-fade`). **`body.navigating #app`** — прозрачен: класс ставит [shell/fade.rs](../../../../../src/shell/fade.md) сразу по клику на ссылку другой страницы.
2. Новая страница приходит со своим `class` у `<body>`, `navigating` исчезает, и `#app` проявляется.
3. **View Transitions** (их запускает islands router): `.background-image` получает `view-transition-name: site-background`, а `::view-transition-group(site-background)` без анимации, поэтому фон стоит на месте. `::view-transition-old(root)` уходит с размытием `--blur-text` за `--dur-fast` (`viewBlurOut`), `::view-transition-new(root)` проявляется из размытия за `--dur` (`viewBlurIn`). Так же выглядит смена языка: текст коротко размывается и проявляется переведённым.
4. **`[data-aos="fade-down"]`**, **`[data-aos="fade-up"]`** — появление заголовка и поиска (`aosFadeDown`, `aosFadeUp`: сдвиг на `--space-lg` и прозрачность, `--dur-slow`). Анимации заданы только для `body:not(.navigating)`: на время перехода они снимаются и включаются снова, поэтому повторяются на каждой новой странице, хотя router оставляет те же узлы.

## Уменьшение движения
При `prefers-reduced-motion: reduce` движение и размытие выключены. Остаётся только смена прозрачности (`pageFadeIn`, `pageFadeOut`, `--dur-fade`): она не двигает содержимое, поэтому переходы остаются плавными.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

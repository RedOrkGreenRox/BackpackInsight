# [Переходы между страницами (_page-transitions.scss)](/RBackend/crates/branches/style/roots/_roots/shell/navigation/_page-transitions.scss)

## Назначение
Переходы между страницами «будто в глазах размылось — и ты уже на новой» (просьба Ивана 2026-10-07) вместо `#app.fade-out` и библиотеки AOS из TS-версии. Размывается только содержимое; фон и кнопка меню стоят на месте. Длительности и размытие — из токенов [_tokens.scss](../../_tokens.md).

## Содержимое
1. **`#app`** плавно размывается и тускнеет (`filter`, `opacity`, `--dur-nav-out`). **`body.navigating #app`** — размыт (`--blur-nav`) и полупрозрачен: класс ставит [shell/fade.rs](../../../../../src/shell/fade.md) сразу по клику на ссылку другой страницы.
2. Новая страница приходит со своим `class` у `<body>`, `navigating` исчезает, и `#app` проявляется.
3. **View Transitions** (их запускает islands router): `.background-image` (`site-background`) и `.controls-wrapper` (`site-controls`) получают свои `view-transition-name`, их группы без анимации, поэтому фон и кнопка меню стоят на месте. `::view-transition-old(root)` расплывается дальше и гаснет за `--dur-nav-out` (`viewBlurOut`), `::view-transition-new(root)` проступает из размытия `--blur-nav` за `--dur-nav-in` с задержкой в половину ухода (`viewBlurIn`). Смена языка идёт тем же путём без шага 1: текст размывается и проступает переведённым.
4. **`[data-aos="fade-down"]`**, **`[data-aos="fade-up"]`** — появление заголовка и поиска (`aosFadeDown`, `aosFadeUp`: сдвиг на `--space-lg` и прозрачность, `--dur-slow`). Анимации заданы только для `body:not(.navigating)`: на время перехода они снимаются и включаются снова, поэтому повторяются на каждой новой странице, хотя router оставляет те же узлы.

## Уменьшение движения
При `prefers-reduced-motion: reduce` движение и размытие выключены (`#app` при переходе только гаснет). Остаётся только смена прозрачности (`pageFadeIn`, `pageFadeOut`, `--dur-fade`): она не двигает содержимое, поэтому переходы остаются плавными.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

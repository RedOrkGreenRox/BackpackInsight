# [Стили оболочки (_shell.scss)](/Frontend/Web/ground/roots/_roots/_shell.scss)

## Назначение
Агрегатор стилей оболочки приложения (Shell). Собственных правил не содержит — только подключает через `@use` партиалы из папки `shell/` в нужном порядке.

## Подключаемые модули (в порядке `@use`)
1. `shell/navigation/controls-wrapper` — [_controls-wrapper](shell/navigation/_controls-wrapper.md): плавающая панель с кнопкой меню.
2. `shell/sidebar/button-logo` — [_button-logo](shell/sidebar/_button-logo.md): логотип в сайдбаре.
3. `shell/navigation/button-toggle` — [_button-toggle](shell/navigation/_button-toggle.md): кнопка открытия меню.
4. `shell/sidebar/sidebar` — [_sidebar](shell/sidebar/_sidebar.md): боковое меню и затемнение.
5. `shell/sidebar/nav-tab` — [_nav-tab](shell/sidebar/_nav-tab.md): вкладки навигации.
6. `shell/parallax/background` — [_background](shell/parallax/_background.md): параллакс-фон.
7. `shell/sidebar/page-title` — [_page-title](shell/sidebar/_page-title.md): заголовки разделов меню.
8. `shell/sidebar/lang-switcher` — [_lang-switcher](shell/sidebar/_lang-switcher.md): переключатель языка.

## Связи
- Подключается из [_roots.scss](../_roots.md).
- Состояния появления/исчезновения страницы (`body.loaded`, `body.leaving`) описаны не здесь, а в [_interactivity](_interactivity.md).
- TS-часть оболочки: [Shell](../Shell.md), [sidebar.ts](shell/sidebar/sidebar.md), [navigation.ts](shell/navigation/navigation.md), [parallax.ts](shell/parallax/parallax.md), [ui_init](shell/ui_init/ui_init.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

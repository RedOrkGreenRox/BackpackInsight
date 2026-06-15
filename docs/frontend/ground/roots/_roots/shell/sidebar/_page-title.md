# [Заголовок страницы в сайдбаре (_page-title.scss)](../../../../../../../Frontend/Web/ground/roots/_roots/shell/sidebar/_page-title.scss)

## Назначение
Стили подписи `.page-title` (название текущего раздела) в шапке/вкладках сайдбара.

## Задаваемые стили
### `.page-title`
*   `font-size:1.5em; font-weight:700; color: var(--text-default-color); text-shadow:0 2px 8px rgba(0,0,0,0.6); z-index:3; white-space:nowrap`.
*   `transition: color 0.3s ease, text-shadow 0.3s ease`.
*   `@media (max-width:600px)`: `font-size: small`.

## AI-контекст
*   Также используется внутри вкладок ([_nav-tab](_nav-tab.md)), где переопределяется перенос строк. `white-space:nowrap` — для горизонтальной подписи раздела.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

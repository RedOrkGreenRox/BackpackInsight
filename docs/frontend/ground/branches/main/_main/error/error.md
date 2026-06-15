# [Блок ошибок: рендер + стили (error.ts / error.scss)](../../../../../../../Frontend/Web/ground/branches/main/_main/error/error.ts)

> Два файла: [error.ts](../../../../../../../Frontend/Web/ground/branches/main/_main/error/error.ts) (HTML-контейнер) и [error.scss](../../../../../../../Frontend/Web/ground/branches/main/_main/error/error.scss) (стили).

## Назначение
`ErrorRenderer` отдаёт скрытый контейнер `#errorContainer`, наполняемый [ErrorDisplayManager](../managers/validation/ErrorDisplayManager.md); `error.scss` оформляет блок ошибки и его части.

## Логика (error.ts)
*   `static render(): string` → `<div id="errorContainer" class="error" style="display:none" data-aos="zoom-in" role="alert" aria-live="polite"></div>` (a11y: `role=alert`, `aria-live=polite`).

## Стили (error.scss)
### `.error`
*   `background:#c0392b; color:white; padding:1rem; border-radius:8px; margin:1rem 0`.
*   `&.validation-error-header`: `display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem`.
*   `.error-dismiss-btn`: прозрачная кнопка-крестик `background:none; border:none; color:white; font-size:1.2rem; cursor:pointer`.
*   `.validation-error-footer`: `margin-top:0.5rem; font-size:0.9rem; opacity:0.8`.

## AI-контекст
*   Контейнер пустой и скрыт; содержимое и показ управляются `ErrorDisplayManager`. Не наполняйте его в рендере.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине; `.ts`+`.scss` одного компонента объединены).

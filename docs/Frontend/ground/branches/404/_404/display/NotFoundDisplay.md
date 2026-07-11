# [Отображение 404 (NotFoundDisplay.ts)](../../../../../../../Frontend/Web/ground/branches/404/_404/display/NotFoundDisplay.ts)

## Назначение

`NotFoundDisplay` — display-модуль для страницы 404 в рамках [`StructuredBranch`](../../../../roots/StructuredBranch.md). Отвечает только за генерацию HTML:

*   `renderSkeleton()` — скелетон загрузки.
*   `renderError()` — сообщение об ошибке (не используется для 404, но требуется контрактом).
*   `renderFullPage()` — полный рендер страницы: заголовок, текст, кнопка возврата.

## Связи

*   Использует существующие рендереры: [`ContainerRenderer`](../container/container.md), [`TitleRenderer`](../title/title.md), [`TextRenderer`](../text/text.md), [`ButtonRenderer`](../button/button.md).
*   Вызывается из [`NotFoundBranch`](../../NotFoundBranch.md), наследующего [`StructuredBranch`](../../../../roots/StructuredBranch.md).

---

> 📌 **Подпись документации:** создано в рамках миграции 404 на StructuredBranch · 2026-06-18

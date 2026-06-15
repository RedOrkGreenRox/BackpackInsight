# [Контейнер 404: рендер + стили (container.ts / container.scss)](../../../../../../../Frontend/Web/ground/branches/404/_404/container/container.ts)

> Два файла: [container.ts](../../../../../../../Frontend/Web/ground/branches/404/_404/container/container.ts) (HTML-обёртка) и [container.scss](../../../../../../../Frontend/Web/ground/branches/404/_404/container/container.scss) (стили).

## Назначение
Центральная карточка контента 404: `ContainerRenderer` отдаёт обёртку с плейсхолдером `{{CONTENT}}`, `.container-404` оформляет её как dark-glass блок по центру.

## Логика (container.ts)
*   `static render(): string` → `<div class="container-404">{{CONTENT}}</div>`. Плейсхолдер `{{CONTENT}}` заменяется собранным контентом (заголовок/текст/кнопка) на уровне [NotFoundBranch](../../NotFoundBranch.md).

## Стили (container.scss) — `.container-404`
*   Центрирование: `position:absolute; top:50%; left:50%; transform: translate(-50%,-50%)`.
*   Dark Glass: `background: rgba(0,0,0,0.7)`; `border:1px solid rgba(255,255,255,0.1)`; `border-radius:20px`.
*   Размер: `width:100%; max-width:800px; padding: clamp(20px,5vw,60px); text-align:center; z-index:10`; тень `0 10px 40px rgba(0,0,0,0.5)`.
*   `@media (max-height:600px)`: `position:relative; transform:none; margin:20px auto; max-height: calc(100vh - 40px); overflow-y:auto`.

## AI-контекст
*   Шаблон использует строковый плейсхолдер `{{CONTENT}}`, а не DOM-вставку — учитывайте это при правках рендера. На низких экранах центрирование заменяется потоком со скроллом.

---

> 📌 **Подпись документации:** создано/актуализировано при рефактор-документировании (приоритет по глубине; объединены `.ts` и `.scss` одного компонента).

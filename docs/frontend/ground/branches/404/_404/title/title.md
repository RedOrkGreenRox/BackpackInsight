# [Заголовок 404: рендер + стили (title.ts / title.scss)](../../../../../../../Frontend/Web/ground/branches/404/_404/title/title.ts)

> Два файла: [title.ts](../../../../../../../Frontend/Web/ground/branches/404/_404/title/title.ts) (HTML) и [title.scss](../../../../../../../Frontend/Web/ground/branches/404/_404/title/title.scss) (стили).

## Назначение
Крупный заголовок «404»: `TitleRenderer` генерирует `<h1>`, `.title-404` задаёт гигантский кегль с жёсткой тенью и свечением.

## Связи (Dependencies)
*   [Локализация (i18n)](../../../../localization/i18n.md): `t('not_found_title')`.

## Логика (title.ts)
*   `static render(): string` → `<h1 class="title-404">{перевод}</h1>`.

## Стили (title.scss) — `.title-404`
*   Размер: `font-size: clamp(5em,15vw,10em); line-height:1; margin:0; font-weight:700; font-family:'Signika'`.
*   Цвет: `color: var(--text-default-color)`; `opacity:0.95` (фон чуть проглядывает).
*   Тень: `4px 4px 0 #000` (жёсткая форма) + `0 0 20px rgba(255,255,255,0.5)` (свечение).

## AI-контекст
*   Размер задан через `clamp()` (5–10em) — заголовок всегда крупный, но не ломает мобильные. Лёгкая прозрачность — намеренный стилевой приём.

---

> 📌 **Подпись документации:** создано/актуализировано при рефактор-документировании (приоритет по глубине; объединены `.ts` и `.scss` одного компонента).

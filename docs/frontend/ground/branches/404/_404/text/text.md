# [Текст 404: рендер + стили (text.ts / text.scss)](../../../../../../../Frontend/Web/ground/branches/404/_404/text/text.ts)

> Два файла: [text.ts](../../../../../../../Frontend/Web/ground/branches/404/_404/text/text.ts) (HTML) и [text.scss](../../../../../../../Frontend/Web/ground/branches/404/_404/text/text.scss) (стили).

## Назначение
Описательный текст под заголовком 404: `TextRenderer` генерирует абзац, `.text-404` оформляет его с максимальной читаемостью на любом фоне.

## Связи (Dependencies)
*   [Локализация (i18n)](../../../../localization/i18n.md): `t('not_found_text')`.

## Логика (text.ts)
*   `static render(): string` → `<p class="text-404">{перевод}</p>`.

## Стили (text.scss) — `.text-404`
*   Типографика: `font-size: clamp(1.2em,4vw,1.8em); color:#fff; font-family:'Signika'; font-weight:500; line-height:1.5; letter-spacing:0.5px`.
*   Ширина/центрирование: `max-width:600px; margin: 0 auto 40px`.
*   Контурная тень (обводка чёрным со всех сторон) + `0 2px 10px rgba(0,0,0,0.8)` для читаемости поверх картинки.

## AI-контекст
*   Обводка из 4 теней `±1px #000` — приём «текст читаем на любом фоне». При смене шрифта проверьте, что обводка не выглядит грязно.

---

> 📌 **Подпись документации:** создано/актуализировано при рефактор-документировании (приоритет по глубине; объединены `.ts` и `.scss` одного компонента).

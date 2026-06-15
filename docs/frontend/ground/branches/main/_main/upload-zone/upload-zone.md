# [Рендерер зоны загрузки (upload-zone.ts)](../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/upload-zone.ts)

## Назначение
`UploadZoneRenderer` генерирует HTML формы загрузки: скрытый `input[type=file]`, `textarea#jsonInput`, подсказку и кнопку отправки.

## Связи (Dependencies)
*   [Локализация (i18n)](../../../../localization/i18n.md): все подписи через переданную `tFunction`.
*   Поведение навешивает [UploadHandler (upload.ts)](upload.md); стили — [upload-area](upload-area.md), [upload-hint](upload-hint.md), [button-view-profile](button-view-profile.md).

## Логика
*   `static render(tFunction): string` — форма `#uploadForm` с `#uploadArea`, `#fileInput` (`accept=.json`), `#jsonInput`, `#uploadHint` (3 строки, средняя `.pc-only`) и `<button id="submitBtn">`.

## AI-контекст
*   Контракт по id: `#uploadForm/#uploadArea/#fileInput/#jsonInput/#uploadHint/#submitBtn` — по ним работают обработчики. Не меняйте id без синхронной правки `upload.ts`/handlers.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине; `.ts`+`.scss` одного компонента объединены).

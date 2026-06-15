# [Оркестратор загрузки (upload.ts)](../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/upload.ts)

## Назначение
Класс `UploadHandler` связывает зону загрузки с тремя обработчиками ввода (DnD/буфер/файл) и UI, единым колбэком прокидывая полученный текст наверх.

## Связи (Dependencies)
*   [Обработчики (handlers)](handlers/index.md): [DragDropHandler](handlers/DragDropHandler.md), [FileHandler](handlers/FileHandler.md), [ClipboardHandler](handlers/ClipboardHandler.md), [UIHandler](handlers/UIHandler.md).
*   Разметку даёт [UploadZoneRenderer](upload-zone.md).

## Подробное описание
*   Конструктор `(container, onHideError, onContentChange?)` → `init()`.
*   `init()`: находит `#uploadArea/#jsonInput/#fileInput/#uploadHint`; создаёт `UIHandler`, `DragDropHandler` (читает файл через `FileHandler` → `uiHandler.setValue`), `ClipboardHandler`; вешает `change` на `#fileInput` (читает первый файл, сбрасывает `value`), сохраняя ручной деструктор `_fileInputCleanup`.
*   `destroy()`: снимает file-listener и вызывает `destroy()` у всех под-обработчиков, обнуляя ссылки.

## AI-контекст
*   Все источники ввода сходятся в один колбэк `setValue` → единое состояние textarea. `change` у `#fileInput` обрабатывается отдельно (не входит в handlers), поэтому его деструктор хранится вручную — не забывайте про симметрию init/destroy.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине; `.ts`+`.scss` одного компонента объединены).

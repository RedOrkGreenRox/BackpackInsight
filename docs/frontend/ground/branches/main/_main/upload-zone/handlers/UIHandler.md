# [Интерфейс зоны загрузки (UIHandler.ts)](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/handlers/UIHandler.ts)

## Назначение
Управляет визуальной синхронизацией поля ввода `#jsonInput` и подсказки `#uploadHint`: при вводе скрывает подсказку, сбрасывает ошибку и прокидывает значение наверх колбэком.

## Связи (Dependencies)
*   Стили зоны: [upload-zone.scss](../../upload-zone.md).
*   Создаётся и управляется [UploadHandler (upload.ts)](../upload.md); получает колбэки `onHideError`/`onContentChange`.
*   **Нативный DOM**: события через `addEventListener` (своя шина событий отсутствует).

## Подробное описание (реальный API)
*   Конструктор `(input, hint, onHideError, onContentChange)` → `init()`.
*   `private addListener(el, event, handler)` — подписка с автосбором деинсталлятора в `cleanupFns`.
*   `private updateUI()` — скрывает/показывает `hint` (`display: none/flex` по `input.value.trim()`), зовёт `onHideError()` и `onContentChange(value)`.
*   `private init()` — вешает `input`-слушатель на `updateUI`.
*   `public setValue(value)` — программно ставит значение и вызывает `updateUI` (используется при DnD/вставке/выборе файла).
*   `public getValue(): string` — текущее значение поля.
*   `public destroy()` — снимает все слушатели.

## AI-контекст
*   Методов `showHover/hideHover/setLoading/displayError/reset` **нет** — UIHandler делает ровно одно: синхронизирует поле, подсказку и колбэки. Подсветку DnD (`.drag-over`) ставит [DragDropHandler](DragDropHandler.md); ошибки показывает [ErrorDisplayManager](../../managers/validation/ErrorDisplayManager.md).

---

> 📌 **Подпись документации:** актуализировано линтером check_docs.py (исправлены несуществующие методы на реальный API).

# [Менеджер черновиков (DraftManager.ts)](../../../../../../../Frontend/Web/ground/branches/main/_main/managers/DraftManager.ts)

## Назначение
Класс управляет процессом временного сохранения данных игрока. Это предотвращает потерю вставленного JSON-лога при случайной перезагрузке страницы или навигации.

---

## Функционал

*   **`initDraftManagement(container)`** — сначала уничтожает прежний обработчик (иначе слушатели копились бы при повторной инициализации), затем создаёт [DraftEventHandler](draft/DraftEventHandler.md), который сохраняет каждое изменение через `StorageManager.save`. Если черновик есть, подставляет его в `#jsonInput`.
*   **`saveDraft(data)`**, **`restoreDraft()`**, **`clearDraft()`** — тонкие обёртки над `save`/`restore`/`clear` из [StorageManager](draft/StorageManager.md). `saveDraft` вызывает [MainManager](MainManager.md).
*   **`destroy()`** — снимает слушатели обработчика.

`clearDraft` и `restoreDraft` в коде сейчас никто не вызывает: после успешной загрузки профиля черновик остаётся в хранилище.

---

## Связи (Dependencies)
*   **Использует**: [**DraftEventHandler**](draft/DraftEventHandler.md) для захвата событий и [**StorageManager**](draft/StorageManager.md) для работы с памятью браузера.

---

> 📌 **Подпись документации:** создано вручную в рамках глубокого аудита кодовой базы · 2026-06-15; переписано по исходнику · 2026-10-06

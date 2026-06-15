# [Хранилище черновиков (StorageManager.ts)](../../../../../../../../Frontend/Web/ground/branches/main/_main/managers/draft/StorageManager.ts)

## Назначение
Статическая прослойка над `SessionStorage` для сохранения черновика введённого JSON, чтобы данные не терялись при случайной перезагрузке до отправки.

## Связи (Dependencies)
*   Вызывается из [DraftEventHandler](DraftEventHandler.md) (через колбэк `onSave`) и [DraftManager](../DraftManager.md).

## Подробное описание (реальный API, все `static`)
*   `save(data: string): void` — записывает строку черновика в `SessionStorage` под фиксированным ключом.
*   `restore(): string | null` — извлекает сохранённый черновик (или `null`).
*   `clear(): void` — удаляет черновик (после успешной отправки профиля).

## AI-контекст
*   Методы называются `save/restore/clear` (НЕ `saveDraft/loadDraft/clearDraft`). `SessionStorage` выбран намеренно: данные исчезают при закрытии вкладки (логи объёмны и потенциально конфиденциальны).

---

> 📌 **Подпись документации:** актуализировано линтером check_docs.py (исправлены несуществующие методы на реальный API).

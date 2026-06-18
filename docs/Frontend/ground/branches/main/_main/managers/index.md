# [Barrel менеджеров главной (index.ts)](../../../../../../../Frontend/Web/ground/branches/main/_main/managers/index.ts)

## Назначение
Индексный файл, реэкспортирующий все менеджеры `MainBranch` для единой точки импорта.

## Связи (Dependencies)
*   Основные: [DraftManager](DraftManager.md), [FormManager](FormManager.md), [MainManager](MainManager.md).
*   Саб-менеджеры: [SubmitManager](submit/SubmitManager.md), [ValidationManager](ValidationManager.md).
*   Утилиты: [StorageManager](draft/StorageManager.md), [DraftEventHandler](draft/DraftEventHandler.md), [ErrorDisplayManager](validation/ErrorDisplayManager.md).

## AI-контекст
*   Единая точка импорта менеджеров главной. Новый менеджер обязательно добавляйте сюда (и в нужную секцию: основной/саб/утилита).

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине; `.ts`+`.scss` одного компонента объединены).

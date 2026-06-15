# [Barrel модулей главной (index.ts)](../../../../../../Frontend/Web/ground/branches/main/_main/index.ts)

## Назначение
Индексный файл ветки главной: реэкспортирует рендереры, менеджеры и обработчик загрузки.

## Связи (Dependencies)
*   Рендереры: [ContainerRenderer](container/container.md), [TitleRenderer](title/title.md), [UploadZoneRenderer](upload-zone/upload-zone.md), [ErrorRenderer](error/error.md).
*   Менеджеры: реэкспорт из [managers/index](managers/index.md) (`FormManager, DraftManager, MainManager, ValidationManager, SubmitManager`).
*   [UploadHandler](upload-zone/upload.md).

## AI-контекст
*   Используется [MainBranch](../MainBranch.md). Единая точка импорта частей главной страницы.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

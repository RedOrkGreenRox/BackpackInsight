# [Barrel черновиков (index.ts)](../../../../../../../../Frontend/Web/ground/branches/main/_main/managers/draft/index.ts)

## Назначение
Barrel-файл (точка реэкспорта) модуля черновиков. Логики не содержит — упрощает импорт.

## Связи (Dependencies)
*   Реэкспортирует `[StorageManager](StorageManager.md)` и `[DraftEventHandler](DraftEventHandler.md)`.

## Содержимое
`export { StorageManager } from './StorageManager';`
`export { DraftEventHandler } from './DraftEventHandler';`

## AI-контекст
*   При добавлении новой сущности в модуль draft добавляйте её реэкспорт сюда, чтобы внешний код импортировал из `draft`, а не из конкретных файлов.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

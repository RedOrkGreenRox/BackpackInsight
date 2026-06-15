# [Barrel валидации (index.ts)](../../../../../../../../Frontend/Web/ground/branches/main/_main/managers/validation/index.ts)

## Назначение
Barrel-файл модуля валидации. Реэкспорт без собственной логики.

## Связи (Dependencies)
*   Реэкспортирует `[ErrorDisplayManager](ErrorDisplayManager.md)`.
*   В модуле также есть `[Валидатор JSON (JsonValidator)](JsonValidator.md)` (импортируется потребителями напрямую).

## Содержимое
`export { ErrorDisplayManager } from './ErrorDisplayManager';`

## AI-контекст
*   Сейчас реэкспортируется только `ErrorDisplayManager`. Если `JsonValidator` начнут импортировать через barrel — добавьте его реэкспорт сюда.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

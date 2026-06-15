# [Менеджер валидации (ValidationManager.ts)](../../../../../../../Frontend/Web/ground/branches/main/_main/managers/ValidationManager.ts)

## Назначение
Статический сервис-прослойка между логикой проверки данных и интерфейсом отображения ошибок.

---

## Функционал
*   **`validateAndShowError`**: Выполняет полную цепочку проверок. Сначала проверяет текст на пустоту, затем вызывает [**JsonValidator**](validation/JsonValidator.md). При обнаружении ошибки передает управление в [**ErrorDisplayManager**](validation/ErrorDisplayManager.md).

## Связи (Dependencies)
*   **Логика**: [JsonValidator.ts](validation/JsonValidator.md).
*   **UI**: [ErrorDisplayManager.ts](validation/ErrorDisplayManager.md).

---

> 📌 **Подпись документации:** создано вручную в рамках глубокого аудита кодовой базы · 2026-06-15

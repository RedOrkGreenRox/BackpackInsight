# [Frontend/Web/ground/branches/main/_main/upload-zone/handlers/FileHandler.ts](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/handlers/FileHandler.ts)

## Назначение
Низкоуровневый обработчик файловых операций в зоне загрузки. Превращает выбранный/перетащенный файл в текстовую строку для дальнейшего анализа.

## Связи (Dependencies)
*   `[JsonValidator.ts](../../managers/validation/JsonValidator.md)`: получает прочитанный текст (опосредованно, через колбэк `onContent` вызывающего кода).
*   `[ClipboardHandler.ts](ClipboardHandler.md)` и `[DragDropHandler.ts](DragDropHandler.md)`: основные потребители статических методов этого класса.
*   **Нативный Web API**: чтение выполняется через `Blob#text()` (современная замена `FileReader`). Никакой шины событий — результат отдаётся колбэком.

## Подробное описание (реальная реализация)

### `private static readFile(file: File): Promise<string>`
*   Возвращает `file.text()` — содержимое файла как строку.

### `static readAndProcessFile(file: File, onContent: (content: string) => void): Promise<void>`
*   Асинхронно читает файл и при успехе вызывает `onContent(content)`.
*   Ошибки чтения перехватываются `try/catch` и логируются через `console.error('[FileHandler] ...')`, не роняя UI.

## AI-контекст
*   **Простота — намеренная**: класс делает ровно одно — читает файл в строку. Валидацию структуры, ограничение размера и индикацию загрузки выполняют вызывающие модули (`JsonValidator`, `UIHandler`, ограничение размера — на бэкенде).
*   **Не выдумывайте `FileReader`/`readAsText`**: в текущей реализации используется `Blob#text()`.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации.

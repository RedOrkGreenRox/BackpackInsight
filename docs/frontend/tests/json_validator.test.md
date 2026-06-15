# [Тест валидатора JSON (json_validator.test.ts)](../../../Frontend/Web/tests/json_validator.test.ts)

## Назначение
Vitest-тесты [JsonValidator](../ground/branches/main/_main/managers/validation/JsonValidator.md) — проверки структуры загружаемого JSON профиля.

## Связи (Dependencies)
*   Мокает [i18n](../ground/localization/i18n.md); использует `jsdom` для `document` (нужен `escapeHtml`).

## Покрытие
*   Валидация корректных/битых JSON, экранирование, сообщения об ошибках.

## AI-контекст
*   Целевой модуль `JsonValidator.ts` существует. Обратите внимание: путь мока i18n (`../../../../localization/i18n`) хрупкий — при переносах проверяйте его.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

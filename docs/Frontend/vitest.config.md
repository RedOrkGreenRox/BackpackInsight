# [Конфигурация Vitest (vitest.config.ts)](../../Frontend/Web/vitest.config.ts)

## Назначение
Конфиг тестов Vitest: переиспользует [vite.config](vite.config.md) (алиасы/резолв) и задаёт тестовое окружение.

## Подробное описание
*   `mergeConfig(viteConfig, ...)` — наследует настройки Vite (включая алиасы `@roots/@branches/@utils`).
*   `test.environment='jsdom'` — DOM-окружение для компонентных тестов.
*   `test.globals=true` — глобальные `describe/it/expect`.
*   `test.include=['tests/**/*.test.ts']`.

## Связи (Dependencies)
*   Тесты лежат в [tests/](tests/utils.test.md) и используют алиасы из vite-конфига.

## AI-контекст
*   Благодаря `mergeConfig` тесты видят те же алиасы, что и сборка — не дублируйте резолв. `jsdom` нужен тестам, работающим с `document`.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

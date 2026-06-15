# [Конфигурация TypeScript (tsconfig.json)](../../Frontend/Web/tsconfig.json)

## Назначение
Настройки компилятора TS: строгий режим, bundler-резолюция, алиасы путей, набор проверок.

## Ключевое
*   `target/module: ESNext`, `moduleResolution: bundler`, `noEmit: true`.
*   **Максимальная строгость**: `strict`, `noImplicitReturns`, `noUnusedLocals/Parameters`, `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`.
*   `paths`: `@roots/* @branches/* @utils/*` (зеркалят алиасы [vite.config](vite.config.md)).
*   `include`: `ground/**`, `functions/**`.

## AI-контекст
*   `noUncheckedIndexedAccess` — самая «злая» настройка: обращение по индексу даёт `T | undefined`. Алиасы должны совпадать с vite.config, иначе сборка и типчек разойдутся.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).

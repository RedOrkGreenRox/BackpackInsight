# [Манифест фронтенда (package.json)](../../Frontend/Web/package.json)

## Назначение
npm-манифест веб-приложения: метаданные, скрипты сборки/запуска и зависимости.

## Ключевое
*   `type: module`; скрипты: `dev` (vite), `build` (`tsc && vite build`), `preview`, `start` (`bun run server.ts`), `verify:images`, `analyze:item-text`.
*   Зависимости: `html2canvas`, `aos`, `fuse.js`; dev: `vite`, `typescript`, `sass`, `@types/*`, `bun-types`, `fast-glob`.
*   `engines.node: ^20.19 || >=22.12`.

## Связи (Dependencies)
*   Скрипты ссылаются на [verify-item-images.js](scripts/verify-item-images.md), [analyze-item-text.js](scripts/analyze-item-text.md), [server.ts](server.md), [vite.config](vite.config.md).

## AI-контекст
*   Требование Node ≥20.19/22.12 — из-за Vite 8. Прод-запуск через Bun (`start`), сборка — через Node.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).

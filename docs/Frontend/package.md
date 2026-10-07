# [Манифест фронтенда (package.json)](../../Frontend/Web/package.json)

## Назначение
npm-манифест веб-приложения: метаданные, скрипты сборки/запуска и зависимости.

## Ключевое
*   `type: module`; скрипты: `dev` (vite), `build` (`tsc && vite build`), `preview`, `start` (`bun run server.ts`).
*   Зависимости: `aos` (анимации появления), `flatbuffers` (рантайм декодеров паков), `fuse.js` (нечёткий поиск), `html-to-image` (скриншот профиля); dev: `vite`, `vitest`, `jsdom`, `playwright`, `typescript`, `sass`, `@types/aos`, `@types/node`, `bun-types`, `fast-glob`.
*   `engines.node: ^20.19 || >=22.12`.

## Связи (Dependencies)
*   Скрипты ссылаются на [server.ts](server.md), [vite.config](vite.config.md).

## AI-контекст
*   Требование Node ≥20.19/22.12 — из-за Vite 8. Прод-запуск через Bun (`start`), сборка — через Node.

---

> 📌 **Подпись документации:** аудит зависимостей по исходнику · 2026-10-02

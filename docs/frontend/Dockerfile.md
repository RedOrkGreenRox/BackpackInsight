# [Dockerfile фронтенда (Dockerfile)](../../Frontend/Web/Dockerfile)

## Назначение
Multi-stage образ фронтенда: сборка статики на Node (Vite), затем рантайм на Bun, отдающий собранные файлы и проксирующий API.

## Подробное описание
*   **Stage builder** (`node:22.12-slim`): `npm ci`, `npm run build`, копирование `dist/` в `dist_build/`. Node нужен из-за требований Vite 8 (Node ≥20.19/22.12).
*   **Stage runtime** (`oven/bun:1.1-slim`): копирует исходники (`server.ts`, static) и собранный `dist_build`; запускает [server.ts](server.md).

## AI-контекст
*   Сборка на Node, раздача на Bun — намеренное разделение (Vite требует Node, рантайм лёгкий на Bun). Бандл собирается на этапе build, рантайм Vite не запускает.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).

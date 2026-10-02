# [Конфигурация Vite (vite.config.ts)](../../Frontend/Web/vite.config.ts)

## Назначение
`vite.config.ts` — конфигурация сборки и dev-сервера фронтенда: корень `Frontend/Web`, статика из `static/`, алиасы импортов, разбиение на чанки и прокси на Rust-бэкенд.

## Переменные и хелперы
- `backendUrl` — адрес бэкенда для прокси: `BACKEND_API_URL` или `http://127.0.0.1:8000`.
- `apiSecret` — внутренний секрет: `API_SECRET` / `ROOT_API_SECRET` из окружения, иначе из корневого `.env`.
- `readRootEnv(key)` — читает значение ключа из `../../.env` (без кавычек); при отсутствии файла или ключа возвращает пустую строку.

## Алиасы путей
`@roots` → `ground/roots`, `@branches` → `ground/branches`, `@utils` → `ground/utils`, `@i18n` → `ground/localization/i18n`; `/static` сводится к корню для совместимости путей.

## Сборка (`build`)
- Вход — `index.html`, выход — `dist/`; имена JS: `assets/[name].[hash].js`, чанки — `assets/chunks/[name]-[hash].js`.
- `manualChunks`:
  - vendor-чанки `vendor-aos` и `vendor-fuse`; правило `vendor-html2canvas` осталось, но пакета `html2canvas` в зависимостях нет (скриншоты делает `html-to-image`), поэтому этот чанк не образуется;
  - страницы `page-404`, `page-main`, `page-items`, `page-profile` по сегменту `/branches/<страница>/`;
  - `app-shared` — общее ядро (`roots/Branch*`, i18n, `SlugService`, `ImageFormatService`, `ItemsCacheService`, `ApiService`, `LoadingStates`, `ItemIconService`).
  - Правило `page-item-detail` проверяет путь `/branches/itemDetail/`, которого больше нет: подстраница деталей лежит в `branches/items/itemDetail/` и попадает в чанк `page-items` (см. [ItemDetail_Branch](ground/branches/items/itemDetail/ItemDetail_Branch.md)).
- `assetFileNames` раскладывает CSS, изображения и шрифты по подпапкам `assets/`, все с хешем в имени — поэтому их можно отдавать с долгим кешем (заголовки в [_headers](_headers.md)).
- `cssCodeSplit: false` — один CSS-файл на всё приложение, чтобы страницы не мигали без стилей; `assetsInlineLimit: 4096`; `sourcemap: false`.

## Dev-сервер (`server`)
Порт `5173` (`strictPort`), хост `0.0.0.0`, `Cache-Control: no-cache`. Прокси на `backendUrl` для `/api` (с заголовком `X-Internal-Secret`, если секрет найден), `/sitemap.xml` и `/robots.txt`.

## Прочее
- `optimizeDeps.include`: `aos`, `fuse.js`.
- Требования: Vite 8, Node.js `^20.19.0 || >=22.12.0` ([package.json](package.md)).
- Конфигурация тестов наследует этот файл: [vitest.config](vitest.config.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

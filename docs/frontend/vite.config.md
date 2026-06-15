# [Конфигурация Vite (vite.config.ts)](../../Frontend/Web/vite.config.ts)

## Назначение
Конфиг сборки Vite: корень `Frontend/Web`, алиасы путей, ручное разбиение чанков (vendor/страницы/shared-ядро), политики имён ассетов и dev-сервер.

## Подробное описание
*   `root=__dirname; publicDir='static'; base='/'`.
*   `resolve.alias`: `@roots`, `@branches`, `@utils` (+ `/static`→'').
*   `build`: `outDir='dist'`, `rollupOptions.input=index.html`.
*   **manualChunks**: vendor (`html2canvas`/`aos`/`fuse.js`), страницы (`page-404/main/items/profile/item-detail`), общий `app-shared` (Branch/i18n/SlugService/ImageFormatService/ItemsCacheService/ApiService/LoadingStates/ItemIconService).
*   `assetFileNames` — раздельные пути для css/изображений/шрифтов с хешами; `cssCodeSplit=false`; `assetsInlineLimit=4096`.
*   `server`: host `0.0.0.0`, порт `5173`, HMR.

## Связи (Dependencies)
*   Алиасы соответствуют `paths` в [tsconfig]. Чанк `app-shared` намеренно держит i18n рядом с Branch/LoadingStates (избегание циклов чанков).

## AI-контекст
*   Комментарий в коде предупреждает: разрыв связки i18n↔Branch в чанках вызывает цикл `page-404 → app-shared → page-404`. Меняя `manualChunks`, проверяйте отсутствие циклов.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

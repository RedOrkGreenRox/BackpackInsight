# [Манифест PWA (manifest.json)](../../../Frontend/Web/static/manifest.json)

## Назначение
Web App Manifest: делает сайт устанавливаемым PWA (имя, иконки, тема, режим отображения, ярлыки, скриншоты).

## Ключевые поля
*   `name`/`short_name`/`description`; `start_url='/'`, `scope='/'`, `display='standalone'`, `orientation='portrait-primary'`, `lang='ru'`.
*   `background_color='#121212'`, `theme_color='#4CAF50'`; `categories=[games, entertainment, utilities]`.
*   `icons` — наборы avif/webp/png всех размеров (72…512), `purpose='maskable any'`.
*   `screenshots` — desktop (wide) и mobile (narrow).
*   `shortcuts` — быстрые действия «Загрузить профиль» (`/`) и «Каталог предметов» (`/items`).

## Связи (Dependencies)
*   Подключается из [index.html](../index.html.md); прекэшируется частично [sw.js](sw.md).

## AI-контекст
*   `?v=5` в путях иконок — busting кэша при обновлениях. `purpose='maskable any'` важно для адаптивных иконок Android. Меняя цвета темы — синхронизируйте с `index.html`/`browserconfig.xml`.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).

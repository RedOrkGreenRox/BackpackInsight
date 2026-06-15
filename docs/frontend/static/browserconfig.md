# [Конфигурация плиток Windows (browserconfig.xml)](../../../Frontend/Web/static/browserconfig.xml)

## Назначение
Настройка плиток (tiles) для закреплённого сайта в Windows/IE/Edge: иконки разных размеров и цвет плитки.

## Содержимое
*   `square70x70logo`, `square150x150logo`, `square310x310logo` — пути к png-иконкам.
*   `<TileColor>#121212</TileColor>`.

## Связи (Dependencies)
*   Подключается через `<meta name=msapplication-config>` в [index.html](../index.html.md).

## AI-контекст
*   Легаси-формат для Microsoft. Цвет плитки согласован с `theme/background` из [manifest.json](manifest.md).

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).

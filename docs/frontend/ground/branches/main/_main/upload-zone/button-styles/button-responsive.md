# [Адаптивность кнопки (button-responsive.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/button-styles/button-responsive.scss)

## Назначение
Адаптивные переопределения размеров кнопки `.button-view-profile` через медиа-запросы. Базовые стили — в [button-base](button-base.md).

## Задаваемые стили

### `@media (max-width: 768px)`
*   `.button-view-profile`: `padding:18px; font-size:1.2em; gap:12px`.

### `@media (max-width: 480px)`
*   `.button-view-profile`: `padding:15px; font-size:1em; gap:10px; letter-spacing:0.5px`.

## AI-контекст
*   Файл содержит только `@media`-переопределения. Базовый внешний вид и состояния не дублируются — лежат в соседних атомах.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).

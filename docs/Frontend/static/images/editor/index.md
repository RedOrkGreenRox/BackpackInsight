# Фоны редактора (images/editor/)

## Назначение
Фоны страницы «Редактор» из картинок игры (ContentKit 3.0), AVIF и WebP. Делает их [scripts/editor_ui_art.py](/docs/scripts/editor_ui_art.md).

## Структура
*   `inventory` — рамка инвентаря с каменной сеткой 9 × 6 (687 × 464).
*   `inventory-bag-mode` — то же в режиме сумок (оранжевая сетка).
*   `storage` — фон склада (1048 × 216).
*   `icons/` — иконки кнопок: `reset`, `bag-mode`, `stash-list`, `stash-gravity`, `info` (96 × 96).
*   `heroes/` — круглые значки героев (48 × 48), `shared` — герой не выбран.

## Связи (Dependencies)
*   Стили: [_field.scss](/docs/Backend/crates/branches/style/branches/editor/_field.md) (рамка), [_panels.scss](/docs/Backend/crates/branches/style/branches/editor/_panels.md) (склад и каталог), [toolbar.rs](/docs/Backend/crates/branches/src/branches/editor/ui/toolbar.md) (иконки), [hero.rs](/docs/Backend/crates/branches/src/branches/editor/ui/hero.md) (портреты).

---

> 📌 **Подпись документации:** создано для папок изображений как узлов-целей ссылок · 2026-10-07

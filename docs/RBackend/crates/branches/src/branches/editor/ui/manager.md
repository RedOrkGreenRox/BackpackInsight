# [Остров редактора (manager.rs)](/RBackend/crates/branches/src/branches/editor/ui/manager.rs)

## Назначение
`EditorManager(lang, labels, code)` — ленивый остров редактора (`#[island(lazy)]`): панель кнопок, поле, общая панель склада и каталога, предмет под указателем и окно импорта/экспорта.

## Ключевая функциональность
- Создаёт `Editor` с героем из `code.hero` и кладёт его в контекст; `listen(editor)` вешает слушатели окна ([input.rs](input.md)).
- Первый `Effect` один раз (флаг `loaded`) зовёт `editor_kit(lang)` ([kit_fn.rs](../kit_fn.md)), восстанавливает индексы набора и раскладывает билд из адреса (`url::decode`).
- Второй `Effect` после загрузки набора пишет каждое изменение героя и поля в адрес: `replace_query` с `h`, `b`, `s` ([dom.rs](dom.md), [model/url.rs](../model/url.md)).
- `sizes` / `persist` — настройки зрителя в `localStorage` (`pref`, `set_pref`): клетка поля (`FIELD_KEY`), высота каталога (`CATALOG_KEY`), вид склада (`STASH_KEY`, `list` или `gravity`). Первый запуск эффекта читает, дальше — пишет.
- Разметка: `.ed-editor` (класс `ed-dragging`, пока предмет в руке; `--field-cell` из ручки поля) с `.ed-board` (`Toolbar`, `Field` — по центру) сверху и `.ed-stash` (`Storage` над `Palette`) под ним, `Ghost`, `Exchange`.

## Связи
- Сервер: [branch.rs](../branch.md). Стили: [editor.scss](../../../../style/branches/editor/editor.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

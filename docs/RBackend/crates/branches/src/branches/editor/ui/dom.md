# [branches/branches/editor/ui/dom.rs](/RBackend/crates/branches/src/branches/editor/ui/dom.rs)

## Назначение
Обращения к странице. Работают только в браузере (`hydrate`), на сервере это заглушки.

## Ключевая функциональность
- `rect(node)` — `getBoundingClientRect` узла в `Rect` ([state.rs](state.md)).
- `grab(ev)` — где внутри элемента под событием нажали, доли 0..1 (по умолчанию центр).
- `replace_query(pairs)` — ставит или убирает параметры адреса через `history.replaceState`, только если адрес изменился.
- `json_data_url(json)` — `data:`-ссылка с процентным кодированием для кнопки «Скачать».

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

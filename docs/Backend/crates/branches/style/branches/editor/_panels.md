# [Стили панелей редактора (_panels.scss)](/Backend/crates/branches/style/branches/editor/_panels.scss)

## Назначение
Общая панель склада и каталога `.ed-stash` на фоне склада из игры (`images/editor/storage`, повтор по высоте). Склад `.ed-storage` (клетка 0,7 от клетки поля, линия снизу) сверху: `.ed-pile` и `.ed-body` — свободная зона с гравитацией (высоту задаёт остров, пунктирная рамка видна и у пустого склада; `.ed-stored.ed-body` двумя классами, чтобы перебить `position: relative` у `.ed-stored`), `.ed-storage-list` (не ниже двух строк) и `.ed-stored` — список. Каталог под ним: `.ed-catalog`, `.ed-controls`, `.ed-cards`, `.ed-card`, `.ed-card-art`, `.ed-card-name`, `.ed-loading`.

## Ключевая функциональность
- `.ed-grip` — ручка размера: полоска по краю, курсор `ns-resize`; на сенсорных экранах (`pointer: coarse`) скрыта ([grip.rs](../../../src/branches/editor/ui/grip.md)).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

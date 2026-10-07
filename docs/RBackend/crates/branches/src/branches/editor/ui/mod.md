# [Интерфейс редактора (mod.rs)](/RBackend/crates/branches/src/branches/editor/ui/mod.rs)

## Назначение
Остров редактора и его части. Компилируется и для сервера (каркас страницы), и для WASM (поведение). Наружу открыт только [manager.rs](manager.md).

## Ключевая функциональность
- состояние: [state.rs](state.md); перетаскивание: [drag.rs](drag.md), [input.rs](input.md), [drop.rs](drop.md);
- поле: [field.rs](field.md), [marks.rs](marks.md), [piece.rs](piece.md), [ghost.rs](ghost.md), [grip.rs](grip.md);
- панели: [palette.rs](palette.md), [storage.rs](storage.md), [pile.rs](pile.md), [toolbar.rs](toolbar.md), [hero.rs](hero.md), [exchange.rs](exchange.md);
- страница: [dom.rs](dom.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

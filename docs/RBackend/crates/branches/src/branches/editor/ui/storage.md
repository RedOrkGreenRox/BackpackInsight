# [branches/branches/editor/ui/storage.rs](/RBackend/crates/branches/src/branches/editor/ui/storage.rs)

## Назначение
`Storage(title, empty)` — склад: предметы не на поле, списком в порядке поступления (первый шаг; гравитация как в игре — следующим шагом, решение Ивана). Узел склада — цель для отпускания ([drop.rs](drop.md)).

## Ключевая функциональность
- `Stored(index, piece)` (приватный) — блок размером с охват формы при `Up` с `PieceArt`; нажатие начинает перетаскивание с `Origin::Storage`.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

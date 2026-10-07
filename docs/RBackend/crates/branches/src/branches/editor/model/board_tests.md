# [Тесты правил поля редактора (board_tests.rs)](/RBackend/crates/branches/src/branches/editor/model/board_tests.rs)

## Назначение
Тесты правил поля на наборе из настоящих форм 7.0.0: `SAC` (Sporeweaver's Sac 2×3), `BAG` (Medium Bag 2×2), `STICK` (Wooden Stick 1×2), `MELON` (Watermelon 2×2), `SPORE` (Spore 1×1). `kit()` и `at()` используются и в [file_tests.rs](file_tests.md).

## Ключевая функциональность
- `rotation_matches_the_game_export` — клетки `Left` и `Down` совпадают со `slotPositions` из экспорта игры.
- `items_need_bags_and_stay_on_the_field`, `placing_over_items_and_bags_kicks_them_to_storage`, `bags_carry_items_and_bag_mode_leaves_them`, `reset_drops_bags_in_bag_mode_and_items_otherwise`.

## Связи
- Проверяемый код: [board.rs](board.md), [placed.rs](placed.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

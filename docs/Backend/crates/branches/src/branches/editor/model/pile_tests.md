# [Тесты склада с гравитацией (pile_tests.rs)](/Backend/crates/branches/src/branches/editor/model/pile_tests.rs)

## Назначение
Тесты `Pile` ([pile.rs](pile.md)) на наборе из [board_tests.rs](board_tests.md), склад шириной `WIDTH` = 8 клеток; `settle` гоняет шаги, пока всё не ляжет.

## Тесты
- `falls_to_the_floor` — спора падает на дно, `x` не меняется.
- `stacks_on_other_pieces` — спора над арбузом ложится на него, палка рядом — на дно; высота склада 4.
- `spawn_inside_a_piece_is_lifted_out` — вторая сумка в том же месте встаёт на первую.
- `taking_from_below_lets_the_rest_fall` — без нижнего предмета верхний падает.
- `without_a_hint_new_pieces_line_up_above_the_pile` — пять арбузов без подсказки ложатся в пределах ширины.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

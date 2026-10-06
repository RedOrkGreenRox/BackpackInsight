# [art/render_tests.rs](/RBackend/crates/art/src/render_tests.rs)

## Назначение
Тесты [render.rs](render.md) на PNG одного цвета из [test_kit.rs](test_kit.md).

## Тесты
- `shape_cells_is_bounding_box` — 1×1, L-форма 2×3, пустая форма.
- `exact_size_is_kept` — 120×240 для 1×2 → `Exact`.
- `bag_frame_is_stretched_into_grid` — 255×375 для 2×3 → 240×360, `Stretched`.
- `crosswise_art_is_rotated` — 240×120 для 1×2 поворачивается в 120×240.
- `far_aspect_is_letterboxed` — 100×50 для 1×1 → 120×120 с прозрачной полосой сверху.
- `layers_are_centered_on_the_largest` — маленький слой ложится в центр большого.

Помощник: `cells(points)`.

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06

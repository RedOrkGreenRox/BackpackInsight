# [Стили панели кнопок редактора (_toolbar.scss)](/RBackend/crates/branches/style/branches/editor/_toolbar.scss)

## Назначение
Панель над полем ([toolbar.rs](../../../src/branches/editor/ui/toolbar.md)): `.ed-toolbar` шириной с рамку поля, `.ed-toolbar-gap` отодвигает импорт и экспорт вправо; `.ed-icon` — круглая кнопка-иконка из игры (`.ed-on` — включённый режим сумок).

## Ключевая функциональность
- Выбор героя ([hero.rs](../../../src/branches/editor/ui/hero.md)): `.ed-hero`, `.ed-portrait` (круглый портрет), `.ed-heroes` (всплывающая сетка), `.ed-hero-option`, `.ed-hero-backdrop` (прозрачный слой под списком: щелчок мимо закрывает его; своё имя, потому что `.ed-backdrop` занят окном импорта). На узком экране (до 30rem) всё в одну строку, иконки и кнопки меньше.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

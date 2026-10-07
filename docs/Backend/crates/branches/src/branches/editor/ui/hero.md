# [Выбор героя (hero.rs)](/Backend/crates/branches/src/branches/editor/ui/hero.rs)

## Назначение
`HeroPicker(label, all)` — круглая кнопка-портрет героя билда; по нажатию открывает список героев набора (`Kit::heroes`) и пункт «любой герой». Выбор ставит `Editor::hero`, по нему каталог показывает предметы героя и общие ([palette.rs](palette.md)).

## Ключевая функциональность
- `portrait(hero)` — `/images/editor/heroes/<герой>.webp`; без героя — значок общих предметов (`SHARED_HERO`, `shared`). Значок назван первым словом имени: `Hob Gang` → `hob`. Портреты — значки героев из игры ([editor_ui_art.py](/docs/scripts/editor_ui_art.md)).
- Список — `role="menu"` с пунктами `menuitemradio`; закрывается выбором, повторным нажатием, щелчком мимо (`.ed-hero-backdrop`) или `Escape`.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.

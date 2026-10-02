# [core/slug.rs](/RBackend/crates/core/src/slug.rs)

## Назначение
Доменные типы имени предмета и slug, а также `SlugService` — единое правило построения slug-ов, совпадающее с фронтендовым [SlugService.ts](../../../../Frontend/ground/utils/SlugService.md).

## Типы
- `ItemName(String)` — newtype имени предмета; `new`, `as_str`, `From<&str>`, `From<String>`, `Display`.
- `Slug(String)` — newtype slug-а; `new_unchecked` (без валидации), `as_str`, `Display`.

## `SlugService`
- `to_slug(name)` — нижний регистр → NFKD-нормализация → выбрасывание диакритики (U+0300–U+036F, `is_combining_mark`) → каждая серия символов вне `[a-z0-9]` становится одним дефисом; дефисы в начале и конце убираются. Не-латинские имена дают пустой slug (как и на фронтенде). Пример: `Hunter’s Bow` → `hunter-s-bow`, `Élite Blade` → `elite-blade`.
- `roman_to_arabic(roman)` — римское число в арабское (вычитательная запись, например `IV` → 4); `None` для пустых и некорректных строк.
- `is_roman_numeral(value)` — упрощённая проверка: только символы I, V, X, L, C, D, M, `V/L/D` не повторяются, остальные не больше трёх подряд.
- Вспомогательная `roman_value(ch)` — значение одной римской цифры.

## Потребители
- [image_key](image_key.md) (slug как ключ картинки и номера шагов «Heist Plan»), [catalog/columns](catalog/columns.md).
- [builder/catalog/validate](../../builder/src/catalog/validate.md), [builder/catalog/flatbuffer](../../builder/src/catalog/flatbuffer.md), [api/seo/sitemap](../../api/src/seo/sitemap.md), [cli](../../cli/src/main.md).

## Тесты
Совпадение с примерами TypeScript-версии, пустой slug для кириллицы, римские числа.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

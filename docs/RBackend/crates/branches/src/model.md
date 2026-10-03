# [branches/model.rs](/RBackend/crates/branches/src/model.rs)

## Назначение
Общие типы данных между сервером и островами. Компилируется в обе сборки (`ssr` и `hydrate`). Всё здесь `Serialize + Deserialize`: острова получают эти структуры как пропсы (JSON внутри HTML) и как ответы серверных функций.

## Ключевая функциональность
- **`PAGE_SIZE`** = 48 — карточек каталога в одной порции ([catalog/search.rs](catalog/search.md)).
- **`EAGER_IMAGES`** = 12 — сколько первых карточек грузят картинку сразу и с высоким приоритетом, остальные — лениво ([items/manager.rs](branches/items/manager.md)).
- **`enum Lang`** — `En` (по умолчанию) и `Ru`; `Hash`, потому что служит ключом словаря в `Dict`.
  - `Lang::ALL` — все языки (по ним грузятся словари и строится каталог);
  - `other()` — второй язык, на который ведёт переключатель в боковой панели ([chrome.rs](roots/chrome.md));
  - `code()` — `"en"`/`"ru"` для URL, cookie и атрибута `lang`;
  - `parse(code)` — терпимый разбор: обрезает пробелы, берёт часть до `-`/`_`, без учёта регистра (`ru-RU` → `Ru`); неизвестный код → `None`.
- **`ItemCard`** — карточка в сетке: `slug`, `name`, `rarity` (задаёт CSS-класс цвета), `image` (ключ картинки без формата и расширения; пустой — заглушка). Строится `CatalogItem::card` ([catalog/item.rs](catalog/item.md)).
- **`ItemsPage`** — порция результатов: `cards`, `total` (сколько всего подошло), `page` (номер последней отданной порции с нуля), `has_more`.
- **`ItemsLabels`** — переведённые подписи острова каталога: `title`, `subtitle`, `placeholder`, `empty`, `found` (шаблон с `{0}` для счётчика, который слышит экранный диктор). Острову передаются только нужные строки, а не словарь целиком.

## Связи
- Потребители: [ctx.rs](roots/ctx.md), [request.rs](roots/request.md), [i18n.rs](roots/i18n.md), [items/branch.rs](branches/items/branch.md), [items/search_fn.rs](branches/items/search_fn.md), [items/card.rs](branches/items/card.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.

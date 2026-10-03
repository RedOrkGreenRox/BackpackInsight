# [branches/catalog/fields.rs](/RBackend/crates/branches/src/catalog/fields.rs)

## Назначение
Типобезопасные геттеры полей из обобщённого дерева значений пака (`PackValue`, см. [pack/api_items.rs](/docs/RBackend/crates/pack/src/api_items.md)). Пак `api_items` хранит предмет как JSON-подобное дерево; эти функции позволяют [item.rs](item.md) собирать `CatalogItem` без `match` на каждом поле. Все геттеры терпимы: отсутствующее поле или поле другого типа даёт `None`/пустое значение, а не ошибку.

## Ключевая функциональность
- **`type Object`** = `BTreeMap<String, PackValue>` — объект пака.
- **`object(value)`** — значение как `Object` (`None`, если это не объект). Используется в [load.rs](load.md) для каждой записи пака.
- **`string(object, key)`** — строковое поле (клон).
- **`int(object, key)`** — целое поле (`i64`).
- **`boolean(object, key)`** — логическое поле.
- **`strings(object, key)`** — массив строк; нестроковые элементы молча пропускаются.
- **`array(object, key)`** — срез значений массива; пустой, если поля нет или это не массив.

## Связи
- Потребители: [item.rs](item.md), [load.rs](load.md). Модуль каталога: [catalog/mod.rs](mod.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.

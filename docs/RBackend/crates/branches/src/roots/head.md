# [Заголовок страницы (head.rs)](/RBackend/crates/branches/src/roots/head.rs)

## Назначение
`PageHead` — то, что ветка сообщает о себе для `<head>`: текст `<title>` и описание. Сами теги рисует каркас ([shell.rs](shell.md)), всегда одним и тем же набором и в одном порядке на всех страницах.

## Зачем одинаковый набор
Islands router Leptos при переходе сравнивает старый и новый документ **узел за узлом по порядку**. Если на одной странице в `<head>` есть лишний тег (раньше Редактор и 404 добавляли `<meta name="robots">`), сравнение сдвигается: несовпавший узел заменяется узлом из нового документа, и в итоге из DOM пропадает весь `<body>`. На деле это выглядело так: переход Главная → Редактор оставлял пустую страницу. Поэтому ветки больше не ставят теги `leptos_meta` сами, а возвращают `PageHead` из `Branch::head` ([branch.rs](branch.md)). По той же причине ссылки на WASM ленивых островов стоят на каждой странице ([lazy.rs](lazy.md)).

## Ключевая функциональность
- **`struct PageHead { title, description }`** (`Clone`, `PartialEq`) — полные строки, уже на языке запроса.
- **`PageHead::section(name, description)`** — заголовок «{name} | Backpack Insight» для разделов (каталог, редактор).
- **`PageHead::site(description)`** — заголовок «Backpack Insight» (главная).
- **`tags(self, indexable)`** — три тега в постоянном порядке:
  - `<title>`;
  - `<meta name="description">`;
  - `<meta name="robots">`: `index, follow`, если страница в sitemap (`BranchSpec::sitemap`, [spec.rs](spec.md)), иначе `noindex`.

  Тег `robots` есть на каждой странице, поэтому `<head>` у всех страниц одной формы.

## Тесты
`section_titles_carry_site_name` — формат заголовков `section` и `site`.

## Связи
- Кто вызывает: `App` в [shell.rs](shell.md) — `(entry.head)(&ctx).tags(entry.spec.sitemap)`.
- Реализации `Branch::head`: [MainBranch](../branches/main/mod.md), [ItemsBranch](../branches/items/branch.md), [EditorBranch](../branches/editor/mod.md), [NotFoundBranch](../branches/not_found/mod.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-03.

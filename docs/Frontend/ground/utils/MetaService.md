# [SEO и Мета-данные (MetaService.ts)](../../../../Frontend/Web/ground/utils/MetaService.ts)

## Назначение
Статический сервис для изменения тегов в `<head>` без перезагрузки страницы (SPA): заголовок, мета-теги, `<link>` и JSON-LD. Каждый метод находит существующий тег или создаёт новый, поэтому повторные вызовы не плодят дубликаты.

## API
- `updatePageMeta(meta)` — ставит `document.title` и мета-тег `description` из `PageMeta` ([Branch](../roots/Branch.md)). Вызывается роутером [Gen](../roots/Gen.md) при каждом переходе.
- `setMeta(attr, name, content)` — мета-тег по атрибуту `name` или `property` (например, ключевые слова или OpenGraph `og:image`).
- `setLink(rel, href, hreflang?)` — тег `<link rel>`; с `hreflang` ищется/создаётся отдельный тег для языковой альтернативы. Так задаётся канонический URL (`rel="canonical"`).
- `setJsonLd(id, data)` — `<script type="application/ld+json">` с заданным `id`, содержимое — отформатированный JSON; возвращает элемент.

## Потребители
- [ItemSEOManager](../branches/items/itemDetail/_itemDetail/managers/ItemSEOManager.md) — мета-теги, canonical и JSON-LD предмета.
- [Gen](../roots/Gen.md) — `updatePageMeta` на каждую страницу.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

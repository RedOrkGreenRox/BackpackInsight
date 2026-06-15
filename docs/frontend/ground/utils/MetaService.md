# [SEO и Мета-данные (MetaService.ts)](../../../../Frontend/Web/ground/utils/MetaService.ts)

## Назначение
Статический сервис низкоуровневого управления `<head>`: обновляет `<title>`, мета-теги, `<link>` (canonical/alternate) и JSON-LD. Безопасно создаёт тег, если его ещё нет.

## Связи (Dependencies)
*   Тип `PageMeta` из [Branch](../roots/Branch.md).
*   Потребители: [Генератор UI (Gen.ts)](../roots/Gen.md) (через `updatePageMeta`), [ItemSEOManager](../branches/itemDetail/_itemDetail/managers/ItemSEOManager.md).

## Подробное описание методов
*   `updatePageMeta(meta)` — ставит `document.title` и `description` (для смены страниц SPA).
*   `setMeta(attr, name, content)` — апсертит `<meta name|property=...>` (создаёт при отсутствии).
*   `setLink(rel, href, hreflang?)` — апсертит `<link rel=...>` (учитывает `hreflang` в селекторе).
*   `setJsonLd(id, data)` — апсертит `<script type="application/ld+json" id=...>` с сериализованными данными; возвращает элемент.

## AI-контекст
*   Все методы идемпотентны (апсерт по селектору/id) — безопасно звать на каждом переходе. Очистку JSON-LD при уходе делает потребитель ([ItemSEOManager.cleanup](../branches/itemDetail/_itemDetail/managers/ItemSEOManager.md)).

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

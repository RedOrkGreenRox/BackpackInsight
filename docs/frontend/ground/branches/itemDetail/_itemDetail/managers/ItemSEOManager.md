# [SEO-менеджер предмета (ItemSEOManager.ts)](../../../../../../../Frontend/Web/ground/branches/itemDetail/_itemDetail/managers/ItemSEOManager.ts)

## Назначение
Обновляет SEO-окружение страницы предмета: `<title>`, мета-теги (description/keywords), Open Graph, canonical/alternate-ссылки и структурированные данные JSON-LD (`schema.org/Thing`). Умеет восстанавливать исходный title и чистить JSON-LD.

## Связи (Dependencies)
*   [SEO и Мета-данные (MetaService)](../../../../utils/MetaService.md) — низкоуровневые `setMeta/setLink/setJsonLd`.
*   [Сервис иконок](../../../../utils/ItemIconService.md) и [Сервис форматов изображений](../../../../utils/ImageFormatService.md) — абсолютный URL картинки для OG.
*   [Локализация (i18n)](../../../../localization/i18n.md).

## Подробное описание методов
*   Поля: `jsonLdId = 'item-detail-json-ld'`, `originalTitle` (снимок `document.title`).
*   `update(item, isProfile)` — формирует описание (первые 160 символов tooltips), абсолютный URL картинки, выставляет title, description, keywords, og:title/description/image/url, canonical и `alternate` (ru/en, перепись путей `/item/`→`/en/item/`), затем `updateStructuredData`.
*   `restore()` — возвращает исходный `document.title`.
*   `cleanup()` — удаляет ранее вставленный JSON-LD по id.
*   `updateStructuredData(item, url, image)` (private) — собирает объект `schema.org/Thing` (name, description, image, identifier, category, brand=Backpack Brawl, additionalProperty с редкостью/ценой/типом, mainEntityOfPage) и отдаёт в `MetaService.setJsonLd`.

## AI-контекст
*   `restore()`/`cleanup()` обязаны вызываться при уходе со страницы, иначе title и JSON-LD «протекут» на другие страницы SPA.
*   Логика alternate-ссылок завязана на структуру URL (`/item/`, `/profile/item/`, префикс `/en/`). При смене схемы маршрутов синхронизируйте здесь.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

# [SEO деталей предмета (ItemSEOManager.ts)](../../../../../../../../Frontend/Web/ground/branches/items/itemDetail/_itemDetail/managers/ItemSEOManager.ts)

## Назначение
Обновляет заголовок вкладки, мета-теги и структурированные данные schema.org под открытый предмет и откатывает изменения при закрытии подстраницы. Создаётся и уничтожается в [ItemDetailLogic](../logic/ItemDetailLogic.md).

## API
- `update(item, isProfile)`:
  - `document.title` = `<имя> - Backpack Insight | <Профиль|Предметы>` (подписи из [i18n](../../../../../localization/i18n.md));
  - через [MetaService](../../../../../utils/MetaService.md) `setMeta()` ставит `description` (первые 160 символов тултипов), `keywords` (имя, игра, редкость, типы), `og:title`, `og:description`, `og:image` (абсолютный URL иконки из [ItemIconService](../../../../../utils/ItemIconService.md) + [ImageFormatService](../../../../../utils/ImageFormatService.md)), `og:url`;
  - `setLink('canonical', url)` — канонический URL текущей страницы;
  - вызывает `updateStructuredData`.
- `restore()` — возвращает `document.title`, сохранённый в момент создания менеджера.
- `cleanup()` — удаляет `<script id="item-detail-json-ld">`.

## Приватные
- `updateStructuredData(item, url, absoluteImage)` — собирает JSON-LD `Thing`: имя, описание, изображение, `identifier` (id предмета), категория (типы), бренд «Backpack Brawl», `additionalProperty` (редкость, цена в золоте или «н/д», тип) и `mainEntityOfPage` (`WebPage`). Записывает через `MetaService.setJsonLd()` под id `item-detail-json-ld`.

## Ограничение
Мета-теги `description`/`og:*` и canonical после закрытия не восстанавливаются — откатывается только заголовок и JSON-LD.

---
> 📌 **Подпись документации:** создано по исходнику · 2026-10-02

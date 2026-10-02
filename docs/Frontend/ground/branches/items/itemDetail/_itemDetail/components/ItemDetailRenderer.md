# [Рендерер деталей предмета (ItemDetailRenderer.ts)](../../../../../../../../Frontend/Web/ground/branches/items/itemDetail/_itemDetail/components/ItemDetailRenderer.ts)

## Назначение
Статический HTML-рендерер подстраницы деталей: собирает карточку предмета из навигации, верхнего ряда, сетки формы, статов, описания, рецептов и данных игрока. Не трогает DOM и не хранит состояние — только возвращает строки.

## Публичные методы
- `getMeta(data?)` — `PageMeta` для бранча. Имя предмета берётся по приоритету: `itemData.name` → `name` → `playerItem.name` → `t('unknown_item')`. Заголовок и описание — ключи `item_detail_title` / `item_detail_description` из [i18n](../../../../../localization/i18n.md).
- `renderSkeleton()` — контейнер `.id-container` с одной карточкой-скелетоном из [LoadingStates](../../../../../utils/LoadingStates.md).
- `renderNotFound()` — сообщение `wiki_item_info_not_found`.
- `renderError()` — сообщение `error_server_unavailable`.
- `renderFullPage(data, nav)` — полная разметка. Если `itemData` нет — возвращает `renderNotFound()`. Иначе:
  - класс редкости `rarity-<rarity>` (по умолчанию `Common`) на `.id-card`;
  - в режиме профиля (`playerItem` задан) ссылки ведут на `/profile/item` и `/profile`, иначе на `/items`;
  - теги типов — `generateIconsOrText(itemTypes)` из [icon-parser](../../../../../utils/icon-parser.md);
  - средний ряд: слева [ItemGridRenderer](ItemGridRenderer.md), справа `renderStatsList` из [ItemDetailParts](ItemDetailParts.md);
  - далее описание, кнопка и секция рецептов и блок игрока (тоже из `ItemDetailParts`).

## Приватные методы
- `renderNav(nav, baseUrl, backUrl, backTitle)` — липкая панель `.id-nav`: «предыдущий», кнопка «☰» назад к списку, «следующий».
- `renderNavLink(targetName, dir, baseUrl)` — ссылка `<baseUrl>?item=<slug>` с `data-link` (SPA-навигация через [Gen](../../../../../roots/Gen.md)); без соседа — неактивная кнопка с `aria-disabled`.
- `renderTopRow(item, rarity, rarityClass, tagsHtml)` — иконка героя (`connectedHero` через `parseTextWithIcons`, иначе пустой `.id-hero-empty`), заголовок `h1.id-title`, бейдж редкости и теги.
- `renderDescription(item)` — тултипы, склеенные литералом `\n` и прогнанные через `parseTextWithIcons` (иконки игровых терминов в тексте).

## Стили
Классы `.id-*` описаны в [_layout](_layout.md), [_top-row](_top-row.md), [_stats](_stats.md), [_recipes](_recipes.md), [_grid](_grid.md), [_responsive](_responsive.md).

## Связи
- Вызывается из [ItemDetailDisplay](../display/ItemDetailDisplay.md) и `meta` в [ItemDetail_Branch](../../ItemDetail_Branch.md).
- Slug соседей — [SlugService](../../../../../utils/SlugService.md).

---
> 📌 **Подпись документации:** создано по исходнику · 2026-10-02

# [Рендерер деталей предмета (ItemDetailRenderer.ts)](../../../../../../../Frontend/Web/ground/branches/itemDetail/_itemDetail/components/ItemDetailRenderer.ts)

## Назначение
Чистый (stateless) набор статических методов, генерирующих HTML страницы детального просмотра предмета: скелетон, состояния «не найдено»/«ошибка», полная карточка, навигация «пред/след», блок игрока и вики-блок.

## Связи (Dependencies)
*   [Базовый Бранч (PageMeta)](../../../../roots/Branch.md) — тип мета-данных.
*   [Типы деталей предмета](../utils/item-detail-types.md) — `ItemDetailData`, `NavigationState`, `ItemDefinition`.
*   [Сервис форматов изображений](../../../../utils/ImageFormatService.md), [Сервис иконок](../../../../utils/ItemIconService.md), [SlugService](../../../../utils/SlugService.md), [Парсер иконок](../../../../utils/icon-parser.md), [Состояния загрузки](../../../../utils/LoadingStates.md).
*   [Локализация (i18n)](../../../../localization/i18n.md).

## Подробное описание методов
*   `getMeta(data)` — выбирает имя предмета из нескольких возможных полей (с fallback `t('unknown_item')`) и формирует `PageMeta` (title/description).
*   `renderSkeleton()` — каркас загрузки через `LoadingStates.createCardSkeleton`.
*   `renderNotFound()` / `renderError()` — заглушки на случай отсутствия данных/ошибки сервера.
*   `renderFullPage(data, nav)` — основная сборка: вычисляет `rarityClass`, режим профиля (`data.playerItem`), `baseUrl`/`backUrl`, путь к картинке (через `ItemIconService`+`ImageFormatService`), типы предмета (`generateIconsOrText`), и собирает карточку (навигация → заголовок → шапка с героем/ценой/редкостью/типами → изображение → блок игрока → вики-блок).
*   `renderNavLink(targetName, dir, baseUrl)` (private) — ссылка «пред/след» или `disabled`-кнопка; slug через `SlugService.toSlug`; a11y-атрибуты.
*   `renderPlayerInfo(playerItem)` (private) — уровень и «карты» (скрывает строку карт, если `cards_need === -1`).
*   `renderCostIcon(cost)` (private) — иконка `Gold` + значение поверх неё.
*   `renderWikiInfo(item)` (private) — описание (`tooltips` через `parseTextWithIcons`) и боевые статы (фильтрует `null`, рисует `<li>` со `stat_*` иконками).

## AI-контекст
*   Класс намеренно без состояния — только генерация строк. Логика загрузки данных/SEO — в [ItemDataLoader](../managers/ItemDataLoader.md)/[ItemSEOManager](../managers/ItemSEOManager.md).
*   Режим «профиль vs каталог» определяется наличием `data.playerItem` и влияет на base/back-URL — ключевой инвариант.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

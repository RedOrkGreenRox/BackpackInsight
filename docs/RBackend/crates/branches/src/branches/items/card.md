# [branches/branches/items/card.rs](/RBackend/crates/branches/src/branches/items/card.rs)

## Назначение
Карточка предмета в сетке каталога. Один компонент для обеих сборок: сервер рендерит им первую порцию, остров — дописанные порции, поэтому разметка всегда одинакова. Разметка и классы — как у TS-версии (`ItemsLayoutRenderer`), чтобы работали перенесённые стили [_roots/items](../../../style/roots/_roots/items/_items.md).

## Ключевая функциональность
- **`PLACEHOLDER`** (приватная константа) = `"/images/placeholder/placeholder"` — путь заглушки без расширения. Заглушка лежит плоско (`placeholder.avif`, `placeholder.webp`), без папок по формату, как у картинок предметов. До 2026-10-06 адрес строился с папкой формата и отдавал 404.
- **`STAGGER_MS`** = 30 и **`STAGGER_LIMIT`** = 12 (приватные) — шаг задержки появления соседних карточек и номер, после которого задержка начинается заново, как в TS-версии.
- **`ItemCardView(card: ItemCard, index: usize, eager: bool)`** — компонент:
  - адреса картинки строит `image_url` для `avif` и `webp`: при пустом `card.image` — `/images/placeholder/placeholder.{avif,webp}`, иначе `/images/items/avif/{image}.avif` и `/images/items/webp/{image}.webp`. Ключ пустой, если файла картинки нет на диске (`drop_missing_images`, [catalog/mod.rs](../../catalog/mod.md)), поэтому заглушка работает без JavaScript-обработчиков ошибок; обёртка картинки тогда получает класс `no-image`;
  - `--fade-delay` = `(index % STAGGER_LIMIT) × STAGGER_MS` мс в `style` — по нему карточки появляются по очереди ([_leptos.scss](../../../style/_leptos.md));
  - `eager`: `loading="eager"` и `fetchpriority="high"` для первых карточек экрана, иначе `lazy`/`auto`; всегда `decoding="async"`;
  - разметка: `div.item-card-link[data-slug] > div.item-card` с `.item-image-wrapper > picture` (AVIF + `img.item-icon` WebP, `alt` = имя), `span.item-name` и `.item-stats > span.rarity-{редкость в нижнем регистре}`.

Имена предметов не переводятся: в игре они на английском во всех локализациях.

Карточка — не ссылка: страницы предмета в крейте пока нет (см. «Планируется» в [обзоре](../../../../branches.md)).

- **`image_url(image, format)`** (приватная) — адрес картинки предмета или заглушки в нужном формате.

## Тесты
- `item_and_placeholder_urls` — адреса картинки предмета и заглушки в обоих форматах.

## Связи
- Вызывающий: [manager.rs](manager.md) (`index` — место в выдаче, `eager` = `index < EAGER_IMAGES`).
- Данные: `ItemCard` в [model.rs](../../model.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06

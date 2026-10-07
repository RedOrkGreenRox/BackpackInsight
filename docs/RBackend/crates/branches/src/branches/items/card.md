# [Карточка предмета (card.rs)](/RBackend/crates/branches/src/branches/items/card.rs)

## Назначение
Карточка предмета в сетке каталога. Один компонент для обеих сборок: сервер рендерит им первую порцию, остров — дописанные порции, поэтому разметка всегда одинакова. Разметка и классы — как у TS-версии (`ItemsLayoutRenderer`), чтобы работали перенесённые стили [_roots/items](../../../style/roots/_roots/items/_items.md).

## Ключевая функциональность
- **`PLACEHOLDER`** (приватная константа) = `"/images/placeholder/placeholder"` — путь заглушки без расширения. Заглушка лежит плоско (`placeholder.avif`, `placeholder.webp`), без папок по формату, как у картинок предметов. До 2026-10-06 адрес строился с папкой формата и отдавал 404.
- **`STAGGER_MS`** = 30 и **`STAGGER_LIMIT`** = 12 (приватные) — шаг задержки появления соседних карточек и номер, после которого задержка начинается заново, как в TS-версии.
- **`ItemCardView(card: ItemCard, index: usize, eager: bool)`** — компонент:
  - `srcset` для `avif` и `webp` строит `srcset`, `src` — WebP 1x. Картинка (`ItemImage`) приходит из манифеста `art` по `id` ([catalog/art.rs](../../catalog/art.md)); пустая — заглушка `/images/placeholder/placeholder.{avif,webp}` без JavaScript-обработчиков ошибок, обёртка тогда получает класс `no-image`;
  - `--fade-delay` = `(index % STAGGER_LIMIT) × STAGGER_MS` мс в `style` — по нему карточки появляются по очереди ([_leptos.scss](../../../style/_leptos.md));
  - `eager`: `loading="eager"` и `fetchpriority="high"` для первых карточек экрана, иначе `lazy`/`auto`; всегда `decoding="async"`;
  - разметка: `div.item-card-link[data-slug] > div.item-card` с `.item-image-wrapper > picture` (AVIF + `img.item-icon` WebP, оба с 1x/2x, `alt` = имя), `span.item-name` и `.item-stats > span.rarity-{редкость в нижнем регистре}`.

Имена предметов не переводятся: в игре они на английском во всех локализациях.

Карточка — не ссылка: страницы предмета в крейте пока нет (см. «Планируется» в [обзоре](../../../../branches.md)).

- **`srcset(image, format)`** (приватная) — `/images/{x1}.{format} 1x, /images/{x2}.{format} 2x`; у заглушки один адрес.
- **`image_url(image, format)`** (приватная) — `/images/{image}.{format}` или заглушка, если путь пустой.

## Тесты
- `item_and_placeholder_urls` — адреса картинки из манифеста и заглушки в обоих форматах.
- `srcset_has_both_densities` — 1x/2x у картинки и один адрес у заглушки.

## Связи
- Вызывающий: [manager.rs](manager.md) (`index` — место в выдаче, `eager` = `index < EAGER_IMAGES`).
- Данные: `ItemCard` в [model.rs](../../model.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06

# [SSR-страница предмета — Cloudflare Function ([id].ts)](../../../../../Frontend/Web/functions/api/item/[id].ts)

## Назначение
Cloudflare Pages Function: на запрос `GET /api/item/:id` отдаёт **серверно отрендеренный HTML** страницы предмета с полным SEO-набором (мета-теги, Open Graph, hreflang, JSON-LD). Нужна для краулеров/превью ссылок, до загрузки SPA.

## Связи (Dependencies)
*   Бэкенд-данные: тянет `GET ${BASE_URL}/api/items` и ищет предмет по слагу.
*   Точка входа SPA: в HTML встроен `<script type="module" src="/ground/core.ts">` ([ядро](../../../ground/core.md)).
*   Логика слага дублирует [SlugService](../../../ground/utils/SlugService.md) (локальная копия `toSlug`).

## Подробное описание
*   `toSlug(name)` — нормализация (lowercase, NFKD, удаление диакритики, апострофы→`-`, не-алфанум→`-`, схлопывание/обрезка дефисов).
*   `onRequestGet(context)`:
    1.  Берёт `params.id`; без него — `400`.
    2.  Фетчит список предметов, ищет `toSlug(name|id) === itemId`; не найден — `404`.
    3.  Строит `structuredData` (`schema.org/Thing`: name, description, image, identifier, category, brand=Backpack Brawl, additionalProperty: редкость/стоимость/тип, mainEntityOfPage).
    4.  `generateItemHTML` — собирает HTML с `<title>`, description, keywords, canonical, hreflang (ru/en/x-default), OG-тегами, JSON-LD, PWA-мета, инлайновым спиннером и точкой входа SPA.
    5.  Ответ `text/html; charset=utf-8`, `Cache-Control: public, max-age=3600`.
*   Ошибки → `500`.

## AI-контекст
*   `BASE_URL` захардкожен на прод (`backpackinsight.pages.dev`). `toSlug` — копия серверной/клиентской логики: при изменении правил слага синхронизируйте все три места (этот файл, `SlugService.ts`, бэкенд). Контент тут на русском (для ru-краулеров), локализация SPA — отдельно.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

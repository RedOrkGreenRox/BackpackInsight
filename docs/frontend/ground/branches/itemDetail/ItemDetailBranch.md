# [Детали предмета (ItemDetailBranch.ts)](../../../../../Frontend/Web/ground/branches/itemDetail/ItemDetailBranch.ts)

## Назначение
Бранч (страница) детального просмотра предмета. Наследуется от [Branch](../../roots/Branch.md): отдаёт мету и скелетон, а всю работу делегирует менеджеру-оркестратору.

## Связи (Dependencies)
*   [Базовый Бранч](../../roots/Branch.md) (`extends Branch`).
*   [Barrel _itemDetail](_itemDetail/index.md): [ItemDetailRenderer](_itemDetail/components/ItemDetailRenderer.md) (мета/скелетон) и [ItemDetailManager](_itemDetail/managers/ItemDetailManager.md) (логика).
*   Стили: [itemDetail.scss](itemDetail.md).
*   Регистрируется в роутере [Gen](../../roots/Gen.md) на маршруты `/item/:name` и `/profile/item/:name` (см. [core.ts](../../core.md)).

## Подробное описание методов
*   `getMeta(data)` — делегирует [ItemDetailRenderer.getMeta](_itemDetail/components/ItemDetailRenderer.md).
*   `getHtml()` — возвращает скелетон (`renderSkeleton`), пока грузятся данные.
*   `init(data)` — создаёт [ItemDetailManager](_itemDetail/managers/ItemDetailManager.md) и вызывает `init()`.
*   `destroy()` — `manager.destroy()` и обнуление ссылки.

## AI-контекст
*   Сам бранч намеренно «тонкий» (паттерн: Branch = жизненный цикл, Manager = логика, Renderer = HTML). Один и тот же бранч обслуживает каталог и профиль — режим определяется данными (наличием `playerItem`), см. [ItemDetailRenderer](_itemDetail/components/ItemDetailRenderer.md).

---

> 📌 **Подпись документации:** актуализировано при аудите (полнота, точность, ссылки).

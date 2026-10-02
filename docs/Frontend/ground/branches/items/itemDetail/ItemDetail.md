# [Стили подстраницы деталей (ItemDetail.scss)](../../../../../../Frontend/Web/ground/branches/items/itemDetail/ItemDetail.scss)

## Назначение
Корневой SCSS-файл подстраницы деталей предмета. Подключает базовые стили ядра и все компонентные партиалы, а также описывает сам оверлей, в котором монтируется [ItemDetail_Branch](ItemDetail_Branch.md).

## Подключения (`@use`)
- `../../../roots/_roots` — дизайн-переменные и базовые стили ([_roots](../../../roots/_roots.md)).
- Компоненты из `_itemDetail/components/`: [layout](_itemDetail/components/_layout.md), [top-row](_itemDetail/components/_top-row.md), [stats](_itemDetail/components/_stats.md), [recipes](_itemDetail/components/_recipes.md), [grid](_itemDetail/components/_grid.md), [responsive](_itemDetail/components/_responsive.md).

Сам файл подключается из [items.scss](../items.md) (`@use "./itemDetail/ItemDetail"`), поэтому стили попадают в бандл страницы предметов.

## Селекторы
- `.item-detail-overlay` — полноэкранный фиксированный слой (`position: fixed; inset: 0; z-index: 1000`) с затемнением `rgba(0,0,0,0.75)`, размытием фона `backdrop-filter: blur(4px)`, вертикальной прокруткой и отступами `4vh 4vw`. Контент центрирован по горизонтали и прижат к верху.
- `body.low-res-mode .item-detail-overlay` — в режиме экономии ([_low-res](../../../roots/_roots/_low-res.md)) размытие отключается, фон становится плотнее (`0.92`).

## Связи
- Оверлей создаётся в [ItemsManager](../_items/managers/ItemsManager.md) (`openDetail`).

---
> 📌 **Подпись документации:** создано по исходнику · 2026-10-02

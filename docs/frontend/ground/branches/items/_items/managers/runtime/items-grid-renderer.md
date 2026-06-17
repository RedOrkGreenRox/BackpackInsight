# [Рендер сетки предметов](../../../../../../../../Frontend/Web/ground/branches/items/_items/managers/runtime/items-grid-renderer.ts)

## Назначение
Рендерит карточки предметов батчами, управляет infinite scroll, prefetch detail и AOS-анимацией.

## Место в сети
- [Runtime index](index.md)
- [ItemsManager](../ItemsManager.md)
- [Filter index](../filter/index.md)

## Инварианты
- Файл относится только к странице `items`.
- При изменении поведения сначала обновить этот документ и связанные узлы сети.
- Каждый файл модуля должен оставаться не больше 150 строк.

---

> 📌 **Подпись документации:** страница предметов · декомпозиция поиска и rich-фильтров · 2026-06-17

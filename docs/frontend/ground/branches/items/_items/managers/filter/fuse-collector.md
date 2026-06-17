# [Сбор Fuse-результатов](../../../../../../../../Frontend/Web/ground/branches/items/_items/managers/filter/fuse-collector.ts)

## Назначение
Запускает Fuse по weighted terms, агрегирует score по группам и пропускает item только если он попал во все группы.

## Место в сети
- [Filter index](index.md)
- [ItemsFilterManager](../ItemsFilterManager.md)
- [Runtime index](../runtime/index.md)

## Инварианты
- Файл относится только к странице `items`.
- При изменении поведения сначала обновить этот документ и связанные узлы сети.
- Каждый файл модуля должен оставаться не больше 150 строк.

---

> 📌 **Подпись документации:** страница предметов · декомпозиция поиска и rich-фильтров · 2026-06-17

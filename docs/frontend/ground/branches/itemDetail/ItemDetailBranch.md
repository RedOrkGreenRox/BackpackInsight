# [Детализация предмета (ItemDetailBranch.ts)](../../../../../Frontend/Web/ground/branches/itemDetail/ItemDetailBranch.ts)

## Назначение
Класс `ItemDetailBranch` координирует отображение детальной информации о конкретном игровом предмете. Он обеспечивает связку между роутером и сложной логикой визуализации характеристик и рецептов.

---

## Ключевая логика

### 1. Жизненный цикл
*   **`getHtml`**: Мгновенно возвращает [Skeleton Screen](components/ItemDetailRenderer.md), предотвращая визуальный шум при загрузке.
*   **`init`**: Делегирует загрузку данных и отрисовку [**ItemDetailManager**](managers/ItemDetailManager.md).
*   **`destroy`**: Гарантирует очистку менеджера и снятие всех слушателей событий навигации.

### 2. Динамическое SEO
Бранч вызывает метод `getMeta` рендерера для подготовки уникальных заголовков страницы на основе названия предмета, переданного в URL.

---

## Связи (Dependencies)
*   **Управляет**: [`ItemDetailManager`](managers/ItemDetailManager.md).
*   **Рендеринг**: Использует [`ItemDetailRenderer`](components/ItemDetailRenderer.md).

---

> 📌 **Подпись документации:** атомарный документ бранча деталей · 2026-06-15

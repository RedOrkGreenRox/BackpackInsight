# [Секция предметов (items-section.ts)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/items/items-section.ts)

## Назначение
Рендерер контейнера для инвентаря игрока. Управляет выводом сетки всех предметов и кнопкой переключения сортировки инвентаря.

## Функционал
*   **`ItemsSectionRenderer.render(data, currentItemSort)`** — возвращает разметку секции `.section`: заголовок, поле поиска `#profileItemSearch`, кнопку сортировки и сетку `#profileItemsGrid` из карточек [item-card](item-card.md).
*   **Заголовок**: `getItemsTitle(count)` — строка `profile_items_title` с числом предметов.
*   **Подпись кнопки**: `getItemsSortRarity()` / `getItemsSortLevel()` — `items_sort_rarity` или `items_sort_level` по текущей сортировке.
*   **Сортировка**: Содержит переключатель `#itemSortToggle`, позволяющий пользователю упорядочить инвентарь по Редкости или Уровню.
*   **Сетка**: Генерирует контейнер `.items-grid`, в котором рендерится полный массив карточек.

---

> 📌 **Подпись документации:** атомарный рендерер профиля · 2026-06-15; дополнено по исходнику · 2026-10-06

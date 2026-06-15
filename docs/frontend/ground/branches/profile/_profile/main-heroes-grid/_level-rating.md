# [Уровень и рейтинг героя (_level-rating.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/main-heroes-grid/_level-rating.scss)

## Назначение
Стили контейнеров уровня/рейтинга `.main-hero-level-container`/`.main-hero-rating-container`: рамка-картинка на фоне и число поверх неё.

## Задаваемые стили
### Контейнеры
*   `position:relative; width/height:48px; display:flex; center; flex-shrink:0`.
*   `picture/img`: абсолютная рамка на весь контейнер (`z-index:1; object-fit:contain`).
*   `span` (число): `position:relative; z-index:2; font-size:1em; font-weight:800; color: var(--text-default-color); text-shadow: 0 1px 3px black, 0 0 5px black`.

## AI-контекст
*   Паттерн «рамка(z1) + число(z2)» аналогичен компактной [карточке героя в шапке](../header/_stat-hero-card.md), но фиксированный размер 48px.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

# [Карточка героя в шапке (_stat-hero-card.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/header/_stat-hero-card.scss)

## Назначение
Стили карточки героя `.stat-hero-card` в гриде шапки: иконка героя, рамка уровня и значок лиги с числами поверх, плюс анимация смены скина.

## Задаваемые стили
### `.profile-header .stat-hero-card`
*   `display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:10px 20px; height:60px; min-height:50px`.
*   `background:transparent; border:none; overflow:hidden; transition: all 0.3s cubic-bezier(...)`.
*   `&.changing-skin`: `opacity:0; transform:scale(0.95)` — состояние при смене скина.
### Внутренние элементы
*   `.hero-header-row`: горизонтальный ряд (`flex; nowrap; gap:12px; width:100%`).
*   `.stat-hero-icon`: `64x64; object-fit:cover` (в `picture` маска снимается).
*   `.stat-hero-level-container/.stat-hero-rating-container`: `64x64`, центрирование, под наложение рамки/числа.
*   `.stat-hero-level-frame/.stat-hero-league`: абсолютная рамка/значок на весь контейнер (`z-index:1; object-fit:contain`).
*   `.stat-hero-level-text/.stat-hero-rating`: число поверх (`z-index:2; font-size: clamp(12px,2vw,15px); font-weight:800; text-shadow:0 1px 3px #000`).
### Адаптив `≤768px`
*   `transform:scale(0.9); height:auto!important; min-height:0!important; margin:-15px -25px` — компактнее с компенсацией отступов.

## AI-контекст
*   Слои: иконка/рамка(`z1`) → число(`z2`). Класс `.changing-skin` управляется JS [менеджера скинов](../managers/ProfileSkinsManager.md) для плавной анимации.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

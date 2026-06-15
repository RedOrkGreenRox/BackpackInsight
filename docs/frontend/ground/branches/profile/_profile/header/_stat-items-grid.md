# [Грид предметов по редкости в шапке (_stat-items-grid.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/header/_stat-items-grid.scss)

## Назначение
Стили блока статистики предметов по редкости `.stats-items-grid` (иконка редкости + счётчик), а также кнопки «показать ещё» секции предметов.

## Задаваемые стили
### `.profile-header .stats-items-grid`
*   `display:flex; flex-wrap:wrap; align-items:center; gap:15px; padding:10px; width:fit-content; min-height:40px; margin-top:auto`.
*   `background: rgba(0,0,0,0.7); border-radius:10px; transition: all 0.3s cubic-bezier(...)`.
*   `:hover`: `box-shadow: 0 0 16px rgba(var(--azure-raw),0.8); transform: translateY(3px)`.
### `.rarity-item` / `.rarity-icon` / `.rarity-count`
*   `.rarity-item`: `flex; align-items:center; gap:6px; flex-shrink:0`.
*   иконка: `width: clamp(18px,4vw,24px); height:auto; object-fit:contain`.
*   `.rarity-count`: `font-size:14px; font-weight:700; text-shadow:0 1px 2px rgba(0,0,0,0.5)`.
### Адаптив
*   `≤1100px`: центрирование, `gap:8px`; `≤768px`: `padding:8px; gap:6px`; `≤480px`: `padding:6px; gap:4px`, `.rarity-count` 12px.
### Секция предметов (бонусом в этом файле)
*   `.item-card.hidden { display:none }`.
*   `.load-more-container`: центрирование, `margin-top:30px`.
*   `.load-more-btn`: таблетка `padding:12px 30px; border-radius:25px`, стекло `rgba(0,0,0,0.7)`, hover — azure-свечение + `translateY(-2px)`, active — `translateY(1px)`.

## AI-контекст
*   Файл смешивает блок статистики шапки и стили кнопки «load more» секции предметов — исторически. Иконки редкости масштабируются через `clamp()`.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

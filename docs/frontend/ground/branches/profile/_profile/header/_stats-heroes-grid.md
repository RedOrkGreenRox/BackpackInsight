# [Грид героев в шапке (_stats-heroes-grid.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/header/_stats-heroes-grid.scss)

## Назначение
CSS Grid `.stats-heroes-grid` для карточек героев в шапке профиля (3 колонки, адаптив до 2).

## Задаваемые стили
### `.profile-header .stats-heroes-grid`
*   `display:grid; grid-template-columns: repeat(3, minmax(80px,1fr)); gap:10px; padding:15px; width:100%`.
*   `background: rgba(0,0,0,0.7); border-radius:10px; box-shadow: 0 12px 40px rgba(0,0,0,0.6); transition: all 0.3s cubic-bezier(...)`.
*   `:hover`: `box-shadow: 0 0 16px var(--azure); transform: translateY(2px)`.
### Адаптив `≤480px`
*   `grid-template-columns: repeat(2,1fr); padding:10px; gap:12px`.

## AI-контекст
*   `minmax(80px,1fr)` гарантирует минимальную ширину карточек героев. Hover-свечение завязано на `--azure`.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

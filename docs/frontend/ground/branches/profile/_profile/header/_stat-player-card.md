# [Шапка профиля и фон (_stat-player-card.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/header/_stat-player-card.scss)

## Назначение
Базовые стили самой шапки профиля `.profile-header` (флекс-колонка) и её фонового изображения `.header-bg` (арена).

## Задаваемые стили
### `.profile-header`
*   `position:relative; display:flex; flex-direction:column; align-items:center; padding:40px 20px; border-radius:15px; z-index:1; overflow:hidden`.
### `.header-bg`
*   `position:absolute; inset:0 (top/left:0; width/height:100%); z-index:-1; pointer-events:none` — фон под контентом.
### `.header-bg img`
*   `width/height:100%; object-fit:cover; object-position:center; filter: brightness(0.6)` — затемнение для читаемости текста.

## AI-контекст
*   `overflow:hidden` + `z-index` обеспечивают корректное наложение контента поверх фоновой арены. Фон арены подставляется по `data.area` (см. [header.md](header.md)).

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

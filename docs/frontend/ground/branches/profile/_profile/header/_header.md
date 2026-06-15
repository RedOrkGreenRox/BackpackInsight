# [Стили шапки профиля (_header.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/header/_header.scss)

## Назначение
Агрегатор стилей шапки профиля: подключает все под-стили заголовка через `@use` и задаёт сам контейнер `.profile-header` (флекс-раскладка, фон арены, затемнение).

## Связи (Dependencies)
Подключает (`@use`) атомы заголовка:
*   [_nickname](_nickname.md), [_stats-player-grid](_stats-player-grid.md), [_stat-player-card](_stat-player-card.md), [_stats-heroes-wrapper](_stats-heroes-wrapper.md), [_stats-heroes-grid](_stats-heroes-grid.md), [_stat-hero-card](_stat-hero-card.md), [_stat-items-grid](_stat-items-grid.md), [_actual-version](_actual-version.md).
*   HTML формирует [HeaderRenderer (header.ts)](header.md); фоны — [/images/area/](../../../../../static/images/area/index.md).

## Задаваемые стили
### `.container .profile-header`
*   Раскладка: `display:flex; flex-direction:row; flex-wrap:wrap; justify-content:space-between; align-items:flex-start; gap: clamp(10px,3vmin,20px); padding: clamp(15px,4vmin,30px)`.
*   Размер: `width: calc(100% - 30px); max-width:1100px; min-height: min(400px,80vh); margin: clamp(40px,12vh,150px) auto 40px`.
*   Фон арены: `background-size:cover; background-position:center; background-repeat:no-repeat; border-radius:25px; overflow:hidden`.
*   **Затемнение**: `box-shadow: inset 0 0 0 2000px rgba(0,0,0,0.3)` — равномерная тёмная вуаль поверх фоновой картинки для читаемости текста (НЕ `backdrop-filter`).

## AI-контекст
*   Затемнение фона реализовано приёмом «гигантская inset-тень», а не blur — дешевле для GPU. Само фоновое изображение подставляет [header.ts](header.md) по `data.area`; слой `.header-bg` уходит под контент отрицательным z-index ([_stat-player-card](_stat-player-card.md)).

---

> 📌 **Подпись документации:** актуализировано при аудите (barrel-список, точный разбор контейнера, исправлена неточность про backdrop-filter).

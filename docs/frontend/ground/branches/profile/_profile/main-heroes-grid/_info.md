# [Инфо-блок героя (_info.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/main-heroes-grid/_info.scss)

## Назначение
Стили блока с текстовой информацией героя `.main-hero-info` и строкой опыта `.main-hero-exp`.

## Задаваемые стили
### `.main-hero-info`
*   `display:flex; flex-direction:column; align-items:center; justify-content:center; flex-grow:1; gap:4px`.
### `.main-hero-exp`
*   `font-size:0.9em; color: rgba(255,255,255,0.7); font-weight:400; text-shadow:0 1px 2px rgba(0,0,0,0.8)`.
### Адаптив `≤600px`
*   `.main-hero-info`: `align-items:flex-start` — выравнивание влево на мобильных.

## AI-контекст
*   `flex-grow:1` позволяет инфо-блоку занять свободное место в карточке героя.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

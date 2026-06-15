# [Изображение героя и переключение скинов (_image.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/main-heroes-grid/_image.scss)

## Назначение
Стили большого изображения героя `.main-hero-image`, анимации смены скина и боковых кнопок переключения скинов `.skin-btn` (`.prev-skin`/`.next-skin`).

## Задаваемые стили
### `.main-hero-image`
*   `width/height:160px; margin-bottom:15px; position:relative; display:flex; center`.
*   `filter: drop-shadow(0 5px 10px rgba(0,0,0,0.5)); transition: transform 0.3s ease`.
*   `picture/img`: `object-fit:contain; pointer-events:none`; плавность `opacity/transform 0.2s`.
*   `&.changing-skin picture/img`: `opacity:0; transform:scale(0.95)` — анимация смены скина.
*   `.main-hero-card:hover .main-hero-image`: `transform: scale(1.05)`.
### `.skin-btn` (стрелки по бокам)
*   `position:absolute; top/bottom:0; width:5%; z-index:10; background: rgba(255,255,255,0.03); color:#fff; font-size:24px; center`.
*   `:hover`: фон `rgba(255,255,255,0.1)`.
*   `.prev-skin`: слева, скругление слева, `::before { content:'‹' }`.
*   `.next-skin`: справа, скругление справа, `::before { content:'›' }`.
### Адаптив `≤600px`
*   `.main-hero-image`: `90x90; margin-bottom:0`; `.skin-btn`: `font-size:18px`.

## AI-контекст
*   `.changing-skin` управляется JS [менеджера скинов](../managers/ProfileSkinsManager.md). Стрелки рисуются псевдоэлементами (`‹`/`›`), без отдельных ассетов.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).

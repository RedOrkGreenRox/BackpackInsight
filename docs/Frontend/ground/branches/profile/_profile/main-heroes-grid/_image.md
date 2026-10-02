# [Портрет героя и кнопки скинов (_image.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/main-heroes-grid/_image.scss)

## Назначение
Стили большого портрета героя в карточке сетки героев и полупрозрачных кнопок переключения скинов. Разметку строит [hero-card](../heroes/hero-card.md).

## Селекторы
- `.main-hero-image` — блок 160×160 с тенью `drop-shadow`, центрирует `picture`/`img` (`object-fit: contain`, без перехвата кликов). Картинка плавно меняет `opacity` и `transform` — этим пользуется подмена скина в [ProfileManager](../managers/ProfileManager.md) (`applySkinToImage` гасит и снова показывает картинку).
- Модификатор `changing-skin` у `.main-hero-image` прячет и чуть уменьшает картинку. В текущем коде ни один модуль этот класс не ставит — смена скина анимируется инлайн-стилем `opacity`.
- `.main-hero-card:hover .main-hero-image` — увеличение портрета на 5% при наведении на карточку ([_card](_card.md)).
- `.skin-btn` — узкая (5% ширины) полоса во всю высоту карточки, почти прозрачная; ярче при наведении; белая стрелка 24px.
- `.prev-skin` — у левого края, стрелка «‹»; `.next-skin` — у правого края, стрелка «›» (через `::before`).
- **≤ 600px**: портрет 90×90 без нижнего отступа, стрелки 18px.

## Связи
- Логика кнопок: [ProfileSkinsManager](../managers/ProfileSkinsManager.md).
- Агрегатор: [_main-heroes-grid](_main-heroes-grid.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

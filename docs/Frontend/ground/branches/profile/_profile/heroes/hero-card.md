# [Карточка героя (hero-card.ts)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/heroes/hero-card.ts)

## Назначение
`HeroCardRenderer` — статический рендерер большой карточки героя в сетке героев профиля. Возвращает HTML-строку, поведения не содержит.

## `render(hero)`
Строит `.main-hero-card` (анимация появления `data-aos="fade-up"`) с атрибутами для сортировки и скинов: `data-level`, `data-rating`, `data-prestige`, `data-hero-name` (нижний регистр) и `data-current-skin="01"`.

Внутри:
- кнопки `.skin-btn.prev-skin` / `.skin-btn.next-skin` — переключение облика ([ProfileSkinsManager](../managers/ProfileSkinsManager.md));
- `.main-hero-image` — `<picture>` с AVIF/WebP-источниками `/images/heroes/<hero>/<format>/<hero><skin_num>.<ext>`;
- `.main-hero-header-row`:
  - рамка уровня `.main-hero-level-frame` — файл `frame_prestige.*` для героя с престижем, иначе `frame_common.*`; поверх — число уровня;
  - `.main-hero-info` — имя и опыт в виде текста `experience / exp_req` с разделителями тысяч;
  - иконка ранга лиги `rank<league>.*` и число рейтинга.

## `formatRating(rating)` (приватный)
Число, показываемое рядом с иконкой ранга: при рейтинге ниже 5000 — остаток от деления на 500 (прогресс внутри лиги), иначе — превышение над 5000.

## Связи
- Вызывается из [heroes-section](heroes-section.md); тип `Hero` — [profile-types](../utils/profile-types.md).
- Атрибуты `data-level`/`data-rating` использует [SortController](../sort/SortController.md) для пересортировки DOM без повторного рендера.
- Стили: [_card](../main-heroes-grid/_card.md), [_image](../main-heroes-grid/_image.md), [_header-row](../main-heroes-grid/_header-row.md), [_level-rating](../main-heroes-grid/_level-rating.md), [_info](../main-heroes-grid/_info.md), [_name](../main-heroes-grid/_name.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

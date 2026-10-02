# [Менеджер скинов (ProfileSkinsManager.ts)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/managers/ProfileSkinsManager.ts)

## Назначение
Логика смены обликов (скинов) героев на странице профиля: разбор доступных скинов, построение путей к картинкам и навешивание кнопок «‹ / ›» на карточки героев. DOM-изменения картинок делегируются колбэкам [ProfileManager](ProfileManager.md).

## API
- `parseSkinsData(jsonText)` — разбирает JSON из скрытого элемента `#skins-data` в словарь «герой → список кодов скинов»; ключи приводятся к нижнему регистру, пустые значения отбрасываются, ошибка JSON даёт `{}`.
- `getUniqueSkins(heroName, skinsMap)` — список скинов героя: базовый `01` плюс разблокированные, без дубликатов, отсортированный по строке.
- `getSkinImagePaths(heroName, skin)` — пути `/images/heroes/<hero>/webp/<hero><skin>.webp` и аналогичный `avif`.
- `attachSkins(container, addListener, updateHeaderSkinFn, applySkinFn)` — для каждой `.main-hero-card` (имя из `data-hero-name`):
  - если скин один — прячет кнопки `.skin-btn`;
  - иначе кнопки `.prev-skin`/`.next-skin` циклически сдвигают индекс и вызывают внутреннюю `updateSkin`, которая через `applySkinFn` меняет картинку `.main-hero-image img`, записывает `data-current-skin` и через `updateHeaderSkinFn` обновляет мини-карточку в шапке. Клик не всплывает (`stopPropagation`).

## Связи
- Разметка карточки и кнопок: [hero-card](../heroes/hero-card.md); стили кнопок — [_image.scss](../main-heroes-grid/_image.md).
- Восстановление сохранённых скинов — `restoreSkins` в [ProfileManager](ProfileManager.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

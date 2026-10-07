# [Главная страница (main/)](../../../../../Frontend/Web/ground/branches/main/)

## Назначение
Папка стартовой страницы: игрок вставляет или перетаскивает JSON экспорта профиля, страница проверяет его и открывает профиль.

## Состав
- [MainBranch.ts](MainBranch.md) — сборка страницы (`mainSpec`, отображение, загрузчик, логика).
- [main.scss](main.md) — корневые стили страницы.
- `_main/` — компоненты ([индекс](_main/index.md)):
  - разметка: [container](_main/container/container.md), [title](_main/title/title.md), [error](_main/error/error_ts.md), [upload-zone](_main/upload-zone/upload-zone_ts.md);
  - поведение: [MainManager](_main/managers/MainManager.md) координирует [FormManager](_main/managers/FormManager.md), [ValidationManager](_main/managers/ValidationManager.md) и [DraftManager](_main/managers/DraftManager.md) (черновик вставленного JSON);
  - анимации: [animations.scss](_main/animations/animations.md).

## Поток
1. `MainDisplay` рисует каркас, заголовок и зону загрузки.
2. `MainManager` слушает вставку, перетаскивание и ввод, проверяет JSON на лету и показывает ошибки.
3. После успешной проверки менеджер переходит на `/profile` с данными ([профиль](../profile/index.md)).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-06

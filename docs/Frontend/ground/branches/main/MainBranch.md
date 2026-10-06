# [Главная страница (MainBranch.ts)](../../../../../Frontend/Web/ground/branches/main/MainBranch.ts)

## Назначение
Сборка стартовой страницы `/` на [BranchSpec](../../roots/BranchSpec.md) + [BranchRunner](../../roots/BranchRunner.md). Файл содержит три модуля контракта [StructuredBranch](../../roots/StructuredBranch.md) и спецификацию; всё поведение зоны загрузки — в [MainManager](_main/managers/MainManager.md).

## Модули
- `MainDisplay`:
  - `renderSkeleton()` — пустой `div.main-page-skeleton`;
  - `renderError(error)` — `div.error-view` с текстом ошибки;
  - `renderFullPage()` — каркас из `ContainerRenderer` ([container](_main/container/container.md)), в который вместо `{{CONTENT}}` подставляются блок ошибки `ErrorRenderer` ([error](_main/error/error_ts.md)), заголовок `TitleRenderer` ([title](_main/title/title.md)) и зона загрузки `UploadZoneRenderer` ([upload-zone](_main/upload-zone/upload-zone_ts.md)). Тексты берутся через `t` из [i18n](../../localization/i18n.md).
- `MainDataLoader.load()` — данных у страницы нет, сразу возвращает пустой `Promise`.
- `MainLogic`:
  - `init(context, root)` — создаёт `MainManager` с корнем страницы и функцией `t`, вызывает его `init()`;
  - `destroy()` — уничтожает менеджер (снимает слушатели вставки и drag-and-drop) и обнуляет ссылку.

## Экспорты
- `mainSpec` — `id: 'main'`, `routes: ['/']`, класс страницы `main-page`; `meta` собирает заголовок «Backpack Insight — …» из `profile_title` и описание из `main_meta_description`; `logic` создаёт один `MainLogic`.
- `MainBranch` — класс страницы из `BranchRunner.createBranchClass()`; маршрут регистрирует [core.ts](../../core.md).

## Стили
Импортирует [main.scss](main.md).

## Связи
- Обзор папки страницы: [главная страница](index.md). Компоненты: [_main/index](_main/index.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-06

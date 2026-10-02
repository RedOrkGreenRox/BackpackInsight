# [Структурированная страница (StructuredBranch.ts)](/Frontend/Web/ground/roots/StructuredBranch.ts)

## Назначение
`StructuredBranch<TInput, TContext>` — абстрактная надстройка над [Branch](Branch.md), которая реализует жизненный цикл страницы один раз: скелетон → загрузка данных → полный рендер → логика → уничтожение. Наследник лишь подставляет модули. На практике наследника генерирует [BranchRunner](BranchRunner.md) из [BranchSpec](BranchSpec.md).

## Контракты модулей
- `BranchDisplay` — `renderSkeleton()`, `renderError(error, input?)`, `renderFullPage(context, input?)`; все возвращают HTML-строку.
- `BranchData` — `load(input?)` → `Promise<TContext>`.
- `BranchState` — `save(context)` и `restore()` → `TContext | null` (кеш контекста).
- `BranchLogic` — `init(context, root)` (может быть асинхронным) и `destroy()`.
- `BranchContext` — пара `input` + `context`; передаётся фабрике логики в `BranchSpec`.

## Поля наследника
Абстрактные: `pageClass`, `bodyClass`, `display`, `data`, `meta` (объект или функция от входа), метод `createLogic(context, root)`. Необязательное: `state`.

## Жизненный цикл
- `getMeta(data)` — вычисляет мета-данные из `meta` по входу (`extractInput`).
- `getHtml(data)` — запоминает вход и сразу возвращает `<div class="<pageClass>">` со скелетоном.
- `init(data)`:
  1. добавляет `bodyClass` к `body`;
  2. берёт контекст из `state.restore()` или из `data.load(input)`, сохраняет его через `state.save`;
  3. заменяет содержимое контейнера на `renderFullPage(context, input)`;
  4. создаёт логику (`createLogic`) и ждёт `init` всех модулей;
  5. любая ошибка на этих шагах заменяет страницу на `renderError(error, input)`.
- `destroy()` — вызывает `destroy` всех модулей логики и снимает `bodyClass`.
- `extractInput(data)` — по умолчанию возвращает данные как есть; можно переопределить.
- `getLastInput()` — последний вход (нужен `BranchRunner` для `BranchContext`).

## Связи
- Маршрутизация и монтирование: [Gen](Gen.md).
- Страницы: [ItemsBranch](../branches/items/ItemsBranch.md), [ProfileBranch](../branches/profile/ProfileBranch.md), [MainBranch](../branches/main/MainBranch.md), [NotFoundBranch](../branches/404/NotFoundBranch.md), [ItemDetail_Branch](../branches/items/itemDetail/ItemDetail_Branch.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

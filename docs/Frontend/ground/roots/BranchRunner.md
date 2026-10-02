# [Исполнитель спецификаций (BranchRunner.ts)](../../../../Frontend/Web/ground/roots/BranchRunner.ts)

## Назначение
`BranchRunner` превращает декларативную [BranchSpec](BranchSpec.md) в класс страницы и при необходимости регистрирует её маршруты в роутере [Gen](Gen.md). Бизнес-логики страниц не содержит.

## API
- `constructor(spec)` — запоминает спецификацию.
- `createBranchClass()` — возвращает анонимный класс, наследующий [StructuredBranch](StructuredBranch.md), где:
  - `pageClass` = `spec.styles.pageClass` или `spec.id`; `bodyClass` = `spec.styles.bodyClass`;
  - `display`, `data`, `state` берутся из спецификации;
  - `meta` — функция или объект из спецификации, по умолчанию `{ title: 'Backpack Insight', description: '' }`;
  - `createLogic(context, root)` — если `spec.logic` функция, вызывает её с `BranchContext` (`input` из `getLastInput()` и загруженный `context`), иначе возвращает массив как есть.
- `register(router)` — создаёт класс один раз и регистрирует его под каждым путём из `spec.routes`.

## Порядок работы
Сам жизненный цикл (скелетон → `data.load` → `renderFullPage` → `init` логики → `destroy`) реализует `StructuredBranch`; `BranchRunner` только связывает его с модулями спецификации.

## Использование
Все страницы экспортируют `new BranchRunner(spec).createBranchClass()`, а маршруты регистрируются вручную в [core.ts](../core.md) через `router.register(path, () => import(...))`. Метод `register` в текущем коде не вызывается.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

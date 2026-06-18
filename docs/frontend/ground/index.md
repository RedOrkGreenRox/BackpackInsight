# [Ядро фронтенда (Ground)](../../../Frontend/ground)

## Назначение
Сердце клиентского приложения. Содержит SPA-роутер, дизайн-систему (стили), общие сервисы и логику всех страниц сайта.

---

## Содержимое
*   [**core.ts**](core.md): Точка инициализации.
*   [**roots/**](roots/Branch.md): Базовые компоненты и глобальные стили.
    *   [`Branch.ts`](roots/Branch.md) — базовый жизненный цикл страницы.
    *   [`Gen.ts`](roots/Gen.md) — SPA-роутер.
    *   [`StructuredBranch.ts`](roots/StructuredBranch.md) — шаблон страницы с 4 слоями.
    *   [`BranchSpec.ts`](roots/BranchSpec.md) — декларативная спецификация страницы.
    *   [`BranchRunner.ts`](roots/BranchRunner.md) — движок выполнения спецификаций.
    *   [`Shell.ts`](roots/Shell.md) — глобальная оболочка.
*   [**branches/**](branches/index.md): Контроллеры страниц (Ветки).
*   [**utils/**](utils/index.md): Вспомогательные сервисы.

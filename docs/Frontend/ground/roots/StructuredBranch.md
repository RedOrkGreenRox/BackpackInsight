# [StructuredBranch.ts](../../../../Frontend/Web/ground/roots/StructuredBranch.ts)

## Назначение

`StructuredBranch` — это надстройка над базовым [`Branch.ts`](Branch.md), которая превращает страницу из произвольного класса в шаблон с четырьмя слоями ответственности:

- **Display** — рендеринг HTML (`Renderer`, `LayoutRenderer`, `SkeletonRenderer`).
- **Data** — загрузка, кеширование и хранение состояния (`DataManager`, `StateManager`, `CacheService`).
- **Logic** — инициализация событий, оркестрация, навигация (`Manager`, `Controller`, `InputController`, `NavigationController`).
- **Styles** — CSS-классы страницы и body (`pageClass`, `bodyClass`).

Класс использует generics `TInput` и `TContext` для строгой типизации входных данных роутера и загруженного контекста страницы.

## Связи

- Наследуется от [`Branch.ts`](Branch.md) — базового жизненного цикла страницы.
- Используется [`Gen.ts`](Gen.md) для регистрации маршрутов.
- Является предшественником [`BranchSpec`](BranchSpec.md) + [`BranchRunner`](BranchRunner.md): BranchSpec декларирует страницу, а StructuredBranch реализует её жизненный цикл.

## Структура слоёв

```typescript
export abstract class StructuredBranch<TInput = any, TContext = any> extends Branch {
  protected abstract pageClass: string;
  protected abstract bodyClass?: string;

  protected abstract display: BranchDisplay<TInput, TContext>;
  protected abstract data: BranchData<TInput, TContext>;
  protected abstract logic: BranchLogic<TContext>;
  protected abstract state?: BranchState<TContext>;

  protected abstract loadData(input?: TInput): Promise<TContext>;
  protected abstract createLogic(context: TContext, root: HTMLElement): BranchLogic<TContext>;
}
```

## AI-контекст

- Страница, наследующая `StructuredBranch`, обязана определить только свои 4–5 полей, а не реализовывать `getHtml` / `init` / `destroy` вручную.
- Это снижает вероятность появления god objects вроде [`ItemsManager`](../../branches/items/_items/managers/ItemsManager.md) или [`ProfileManager`](../../branches/profile/_profile/managers/ProfileManager.md).
- Любой новый модуль должен помещаться в один из четырёх слоёв. Если не помещается — слой неверно выбран или модуль слишком большой и требует деления.

---

> 📌 **Подпись документации:** создано в рамках внедрения StructuredBranch · 2026-06-18

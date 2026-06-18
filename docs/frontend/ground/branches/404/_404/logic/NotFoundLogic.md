# [Логика 404 (NotFoundLogic.ts)](../../../../../../../Frontend/Web/ground/branches/404/_404/logic/NotFoundLogic.ts)

## Назначение

`NotFoundLogic` — logic-модуль для страницы 404 в рамках [`StructuredBranch`](../../../../roots/StructuredBranch.md). Управляет:

*   инициализацией навигации ([`NavigationManager`](../navigation/navigation.md));
*   установкой и восстановлением случайного фона ([`BackgroundManager`](../background/background.md)).

## Связи

*   Использует [`NavigationManager`](../navigation/navigation.md) и [`BackgroundManager`](../background/background.md).
*   Вызывается из [`NotFoundBranch`](../../NotFoundBranch.md), наследующего [`StructuredBranch`](../../../../roots/StructuredBranch.md).

---

> 📌 **Подпись документации:** создано в рамках миграции 404 на StructuredBranch · 2026-06-18

# 🧩 Корневые системы (roots/)

Стартовый узел для базовых компонентов фронтенда: роутер, жизненный цикл страниц, шаблоны, оболочка и глобальные стили.

## Карта

*   [`Branch.ts`](Branch.md) — базовый абстрактный класс для всех страниц.
*   [`Gen.ts`](Gen.md) — SPA-роутер, управление историей и prefetch.
*   [`StructuredBranch.ts`](StructuredBranch.md) — шаблон страницы с разделением ответственности на Display / Data / Logic / Styles.
*   [`BranchSpec.ts`](BranchSpec.md) — декларативная спецификация страницы.
*   [`BranchRunner.ts`](BranchRunner.md) — движок, выполняющий `BranchSpec` через `Gen`.
*   [`Shell.ts`](Shell.md) — глобальная оболочка (sidebar, фон, язык).
*   [`Parallax.ts`](Parallax.md) — эффект параллакса фона.
*   [`profileCacheUtils.ts`](profileCacheUtils.md) — утилиты кеширования профиля.

## AI-контекст

*   Любая новая страница должна либо наследовать [`Branch`](Branch.md), либо, предпочтительно, использовать [`StructuredBranch`](StructuredBranch.md) или [`BranchSpec`](BranchSpec.md) + [`BranchRunner`](BranchRunner.md).
*   Подробнее о философии см. [`ARENA.MD`](../../../../ARENA.MD).

---

> 📌 **Подпись документации:** создано в рамках внедрения StructuredBranch · 2026-06-18

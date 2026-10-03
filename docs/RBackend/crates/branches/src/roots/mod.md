# [branches/roots/mod.rs](/RBackend/crates/branches/src/roots/mod.rs)

## Назначение
Корни дендритной системы: каркас, через который растут все ветки-страницы. Модуль только объявляет подмодули и реэкспортирует их публичные типы, своей логики не содержит. Компилируется только с фичей `ssr` (см. [lib.rs](../lib.md)).

Имена повторяют TS-фронтенд `Frontend/Web/ground/roots`: [Gen.ts](/docs/Frontend/ground/roots/Gen.md), [Shell.ts](/docs/Frontend/ground/roots/Shell.md), [Branch.ts](/docs/Frontend/ground/roots/Branch.md), [BranchSpec.ts](/docs/Frontend/ground/roots/BranchSpec.md), [BranchRunner.ts](/docs/Frontend/ground/roots/BranchRunner.md).

## Ключевая функциональность
Реэкспорт (`pub use`), всё остальное в модуле приватно:

| Имя | Откуда | Роль |
| :--- | :--- | :--- |
| `Backdrop` | [backdrop.rs](backdrop.md) | фон страницы и его сохранение между переходами |
| `Branch`, `BranchEntry` | [branch.rs](branch.md) | контракт страницы и запись реестра |
| `BranchCtx` | [ctx.rs](ctx.md) | данные запроса для ветки |
| `Gen` | [gen.rs](gen.md) | реестр веток и выбор по пути |
| `Dict` | [i18n.rs](i18n.md) | словари интерфейса |
| `per_lang` | [per_lang.rs](per_lang.md) | своя ветка разметки на каждый язык для островов |
| `BranchRunner` | [runner.rs](runner.md) | маршруты Axum и запуск сервера |
| `shell`, `App` | [shell.rs](shell.md) | HTML-документ и корневой компонент |
| `BranchSpec`, `Params` | [spec.rs](spec.md) | декларативный контракт и параметры пути |

Приватные подмодули без реэкспорта: [chrome.rs](chrome.md) (боковая панель, используется только из `App`) и [request.rs](request.md) (разбор query/cookie, используется только из `BranchCtx`).

## Связи
- Обзор крейта и схема запроса: [branches.md](../../../branches.md).
- Ветки, которые растут из корней: [branches/mod.rs](../branches/mod.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.

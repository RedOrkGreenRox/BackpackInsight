# [Контекст запроса ветки (ctx.rs)](/Backend/crates/branches/src/roots/ctx.rs)

## Назначение
`BranchCtx` — всё, что ветке нужно знать об одном запросе: путь, параметры пути, query, язык, каталог и словарь. Ветки не трогают Axum и контекст Leptos напрямую — только через этот тип.

## Ключевая функциональность
- **Поля.** Публичные: `lang` (язык ответа), `path` (путь без query) и `navigation` (`true`, если запрос пришёл от islands router с заголовком `Islands-Router`, то есть это переход внутри сайта, а не первая загрузка). Приватные: `params`, `query` и `cookies` (пары ключ–значение), `catalog` (`CatalogHandle`), `dict` (`Dict`). При клонировании каталог и словари не копируются: они лежат за `Arc`.
- **`current()`** — собирает контекст из текущего запроса Leptos:
  - берёт `Parts` из контекста; без них путь `/` и язык по умолчанию;
  - разбирает query через `parse_query`, cookie через `parse_cookies` и выбирает язык через `resolve_lang` ([request.rs](request.md));
  - отмечает `navigation` по наличию заголовка `Islands-Router`;
  - добавляет к ответу `Vary: Cookie, Accept-Language`, потому что HTML зависит от языка;
  - если язык пришёл из `?lang=`, ставит cookie `LANG_COOKIE` на год (`Path=/`, `SameSite=Lax`);
  - `CatalogHandle` и `Dict` берёт через `expect_context`: их кладёт `BranchRunner::router` ([runner.rs](runner.md)).
- **`with_params(params)`** — тот же контекст с параметрами, найденными `Gen::resolve`.
- **`param(name)`** — значение параметра пути (`:slug`). Сейчас ни одна ветка не имеет параметров, метод нужен будущей странице предмета.
- **`query(name)`** — первое значение query-параметра (`ItemsBranch` читает `?q=` и `?page=`).
- **`cookie(name)`** — значение cookie из запроса. [backdrop.rs](backdrop.md) читает так `bi_bg` и `bi_bg404`, чтобы фон не менялся при переходах.
- **`remember(name, value)`** — ставит сессионную cookie (`Path=/`, `SameSite=Lax`, без `Max-Age`).
- **`catalog()`** — `LangCatalog` на языке запроса ([catalog/mod.rs](../catalog/mod.md)).
- **`t(key)`** / **`tf(key, args)`** — перевод и перевод с подстановкой через `Dict` ([i18n.rs](i18n.md)).
- **`set_status(status)`** — HTTP-статус ответа через `ResponseOptions`; так `NotFoundBranch` отдаёт 404.
- **`set_cookie`** (приватная функция модуля) — добавляет `Set-Cookie` к ответу; её используют `current()` и `remember()`.

## Связи
- Создаётся в `App` ([shell.rs](shell.md)), передаётся в `Branch::render` ([branch.rs](branch.md)) и в боковую панель ([chrome.rs](chrome.md)).
- Выбор фона по cookie: [backdrop.rs](backdrop.md).
- Тип языка: [model.rs](../model.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.

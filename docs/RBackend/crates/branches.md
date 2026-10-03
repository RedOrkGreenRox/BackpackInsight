# branches — Leptos SSR + Islands фронтенд

## Назначение
Крейт `RBackend/crates/branches` — сайт Backpack Insight на Rust: Leptos 0.8 в режиме SSR + Islands поверх Axum. Он заменяет TS-фронтенд [Frontend/Web](/docs/Frontend/index.md) и сохраняет его «дендритные» имена: `Gen`, `Shell`, `Branch`, `BranchSpec`, `BranchRunner`, страницы `*Branch`, интерактивные острова `*Manager`.

Браузер получает готовый HTML с первого ответа: каталог, словари и маршрутизация живут на сервере. WASM содержит только острова, а страницы работают и без JavaScript (формы и ссылки — обычные GET-запросы). Один процесс отдаёт HTML, серверные функции, `/pkg`, статику и все маршруты [api](api.md), кроме `/`. Переходы по ссылкам перехватывает islands router: страница приходит с сервера, но в DOM меняется только отличающееся, острова и фон остаются на месте.

## Дендритная схема
```text
Gen (реестр)  ──  BranchEntry::of::<B>()  ──  B: Branch { SPEC: BranchSpec, render(BranchCtx) }
   │                                                     │
BranchRunner::router: маршрут Axum на каждый SPEC.path   │
   └─> shell() ─> App ─> Gen::resolve(path) ─> render ───┘ ─> MainBranch / ItemsBranch / EditorBranch / NotFoundBranch
                  │                                                       └─ остров ItemsManager
                  └─ sidebar (остров SidebarManager), Backdrop, остров ParallaxManager
```

| Корень | Документ | TS-аналог |
| :--- | :--- | :--- |
| `Gen` | [roots/gen.rs](branches/src/roots/gen.md) | [Gen.ts](/docs/Frontend/ground/roots/Gen.md) |
| `Branch`, `BranchEntry` | [roots/branch.rs](branches/src/roots/branch.md) | [Branch.ts](/docs/Frontend/ground/roots/Branch.md) |
| `BranchSpec`, `Params` | [roots/spec.rs](branches/src/roots/spec.md) | [BranchSpec.ts](/docs/Frontend/ground/roots/BranchSpec.md) |
| `BranchRunner` | [roots/runner.rs](branches/src/roots/runner.md) | [BranchRunner.ts](/docs/Frontend/ground/roots/BranchRunner.md) |
| `shell`, `App` | [roots/shell.rs](branches/src/roots/shell.md) | [Shell.ts](/docs/Frontend/ground/roots/Shell.md) |
| `BranchCtx` | [roots/ctx.rs](branches/src/roots/ctx.md) + [request.rs](branches/src/roots/request.md) | — |
| `Dict` | [roots/i18n.rs](branches/src/roots/i18n.md) | [i18n.ts](/docs/Frontend/ground/localization/i18n.md) |
| `sidebar`, `SidebarManager` | [roots/chrome.rs](branches/src/roots/chrome.md) + [shell/sidebar.rs](branches/src/shell/sidebar.md) | боковая панель из [Shell.ts](/docs/Frontend/ground/roots/Shell.md) |
| `Backdrop`, `ParallaxManager` | [roots/backdrop.rs](branches/src/roots/backdrop.md) + [shell/parallax.rs](branches/src/shell/parallax.md) | [Parallax.ts](/docs/Frontend/ground/roots/Parallax.md) |
| `per_lang` | [roots/per_lang.rs](branches/src/roots/per_lang.md) | — |

## Путь запроса
1. Axum: `BranchRunner::router` регистрирует `GET` на `axum_path()` каждого `BranchSpec` из `Gen::branches()` и тот же обработчик как `fallback`. Если задан `API_SECRET`, без заголовка `X-Internal-Secret` всё, кроме открытых маршрутов `api`, отвечает 403: снаружи сайт доступен только через прокси Cloudflare Pages ([[[path]].ts](/docs/Frontend/functions/[[path]].md)).
2. Обработчик — `render_app_async_with_context`: кладёт `CatalogHandle` и `Dict` в контекст Leptos и рендерит `shell` → `App`.
3. `App` строит `BranchCtx::current()` (путь, query, cookie, язык `?lang=` → cookie → `Accept-Language`, признак перехода `Islands-Router`), вызывает `Gen::resolve(path)` и рисует боковую панель, фон (при переходе тот же, из cookie), затемнение и `<main data-branch=…>` с `Branch::render`.
4. Неизвестный путь → `NotFoundBranch` со статусом 404. Ответ уходит целиком, без `Suspense`: рендер веток синхронный.

## Остров каталога
- `ItemsBranch` ([items/branch.rs](branches/src/branches/items/branch.md)) рендерит `ItemsManager` с первой порцией карточек (`search_upto`).
- `ItemsManager` ([items/manager.rs](branches/src/branches/items/manager.md)) в браузере ищет по мере ввода (пауза 200 мс), догружает порции при прокрутке к низу страницы и обновляет адрес через `history.replaceState`.
- Данные он берёт у серверной функции `search_items` ([items/search_fn.rs](branches/src/branches/items/search_fn.md)): `GET /_fn/items?lang=…&q=…&page=…`, `Cache-Control: public, max-age=300`.
- Карточка [ItemCardView](branches/src/branches/items/card.md) и ссылки [url.rs](branches/src/branches/items/url.md) общие для сервера и WASM; типы обмена — [model.rs](branches/src/model.md).

## Сервер и WASM
| Фича | Сборка | Что входит |
| :--- | :--- | :--- |
| `ssr` | бинарник [main.rs](branches/src/main.md) + rlib | всё: [roots](branches/src/roots/mod.md), [catalog](branches/src/catalog/mod.md), все [ветки](branches/src/branches/mod.md), `api`, `pack`, `rbackend_core`, Axum, tokio |
| `hydrate` | cdylib → WASM | [model.rs](branches/src/model.md), острова [shell](branches/src/shell/mod.md) и модуль `items` без `ItemsBranch`; точка входа `hydrate()` и islands router в [lib.rs](branches/src/lib.md) |

Каталог ([mod](branches/src/catalog/mod.md), [load](branches/src/catalog/load.md), [item](branches/src/catalog/item.md), [fields](branches/src/catalog/fields.md), [search](branches/src/catalog/search.md), [rarity](branches/src/catalog/rarity.md)) читается один раз на старте из паков и в браузер не уходит.

Стили: [site.scss](branches/style/site.md) подключает перенесённые без изменений стили TS-версии ([_roots](branches/style/roots/_roots.md), [main](branches/style/branches/main/main.md), [items](branches/style/branches/items/items.md), [404](branches/style/branches/404/404.md)), каждую ветку в своей области, и поправки [_leptos.scss](branches/style/_leptos.md). Ветки: [main](branches/src/branches/main/mod.md), [items](branches/src/branches/items/mod.md), [editor](branches/src/branches/editor/mod.md), [not_found](branches/src/branches/not_found/mod.md).

## Сборка и запуск
Настройки cargo-leptos — в `[[workspace.metadata.leptos]]` файла `RBackend/Cargo.toml` (имя `backpack-insight`, `bin-features = ["ssr"]`, `lib-features = ["hydrate"]`, WASM собирается профилем `wasm-release` с `opt-level = "z"`).

```bash
cd RBackend
cargo leptos build --release          # бинарник + target/site/pkg (WASM, JS, CSS)
LEPTOS_OUTPUT_NAME=backpack-insight LEPTOS_SITE_ROOT=target/site \
LEPTOS_SITE_PKG_DIR=pkg LEPTOS_SITE_ADDR=127.0.0.1:3000 \
  ./target/release/branches
```

Перед запуском нужны паки `RBackend/generated/api_items_{en,ru}.fb` и `catalog_summary.fb` — их собирает [builder](build.md) ([builder/main.rs](builder/src/main.md)). Без них `api::AppState::discover` или `Catalog::load` останавливают старт. Корень проекта ищет [api/state.rs](api/src/state.md) (переопределяется `ROOT_PROJECT_ROOT`); оттуда же берутся `Frontend/Web/static` (картинки, шрифты, словари).

## Линты
- `clippy::pedantic` на уровне `warn`, плюс `unwrap_used` и `expect_used`; `needless_pass_by_value` разрешён, потому что `#[component]` и `#[island]` принимают пропсы по значению.
- `#![recursion_limit = "256"]` в [lib.rs](branches/src/lib.md): типы представлений Leptos глубже стандартного лимита.
- `unsafe_code = "deny"` вместо `forbid` из workspace: код-обвязка `wasm-bindgen` содержит `unsafe`, а `deny` всё равно запрещает его в рукописном коде.

## Связи
- [api/lib.rs](api/src/lib.md) — `api::routes` (всё, кроме `/`), `api::require_api_secret` и `api::shutdown_signal`.
- [pack/api_items.rs](pack/src/api_items.md), [core/slug.rs](core/src/slug.md), [core/image_key.rs](core/src/image_key.md).

## Планируется
- **Страница предмета `/item/:slug` и остров `ItemField`.** Дизайн владельца: масштабируемое поле-сетка, где каждый предмет — отдельный «остров». Не реализовано; для неё уже есть `LangCatalog::by_slug`/`by_id` и `BranchCtx::param`. После неё карточки каталога станут ссылками.
- **Ветка профиля** и загрузка профиля на главной (остров `MainManager`) — как в TS-версии; форма на главной уже есть, но пока ничего не отправляет.
- **Содержимое редактора** ([editor](branches/src/branches/editor/mod.md)) — пока пустая заготовка.
- **Ленивые острова** (`#[lazy]`): WASM каждого острова грузится отдельно, только когда он нужен.
- **Полный синтаксис расширенного поиска** ([search_filter_syntax.md](/docs/search_filter_syntax.md)); сейчас — поиск по словам ([search.rs](branches/src/catalog/search.md)).
- **Sitemap из `BranchSpec.sitemap`**: сейчас поле не читается, `/sitemap.xml` отдаёт `api` ([api_sitemap_robots.md](api_sitemap_robots.md)).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.

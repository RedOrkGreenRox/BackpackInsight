# План полного перехода BackpackInsight на Rust

Дата старта: 2026-07-06

## 0. Текущий статус запуска

Проверено в sandbox-окружении:

- Bun установлен локально: `~/.bun/bin/bun`, версия `1.3.14`.
- Docker установлен через apt: `docker.io`, Docker `26.1.5`, Docker Compose `2.26.1`.
- `dockerd` запущен вручную через `sudo dockerd`.
- Локальный `docker-compose.yml` успешно собрал и поднял:
  - `backpack_insight_db` — PostgreSQL 15 Alpine;
  - `backpack_insight_backend` — Python/FastAPI backend;
  - `backpack_insight_web` — Bun frontend server.
- Проверки после docker compose:
  - `GET http://127.0.0.1:8000/` → `{"message":"Backpack Insight API is running"}`;
  - `GET http://127.0.0.1:5080/` → HTML содержит `<title>Backpack Insight</title>`;
  - `GET http://127.0.0.1:5080/api/items?limit=1&lang=en` → первый item `Abyssal Embrace`.

Также ранее проверено:

- Backend tests: `92 passed`.
- Frontend build: OK.
- Frontend tests: `36 passed`.
- Image audit: OK, `1123 items checked`.

---

## 1. Цель новой архитектуры

Не просто переписать проект на Rust, а сделать систему, где:

1. Истина о данных задаётся схемами FlatBuffers.
2. Истина о правилах задаётся Rust oracle crate.
3. SQL проверяется на этапе компиляции через SQLx.
4. HTML страниц создаётся SSR-слоем, а интерактивность подключается islands.
5. ИИ-агент получает формальный oracle CLI и не вынужден гадать по разрозненным JSON/TS/Python-файлам.

Целевой стек:

```text
Backend/API:     Axum
SSR/UI:          Leptos SSR + Islands
DB:              SQLx + migrations
Data contracts:  FlatBuffers
Oracle:          Rust crate bi_oracle
CLI:             bi validate/dump/explain/diff/budget
Build/dev:       cargo-leptos / Trunk / xtask, окончательно выбрать после прототипа
```

Названия архитектурных сущностей сохраняются:

```text
Gen
Branch
BranchSpec
BranchRunner
Shell
ItemsBranch
ProfileBranch
ItemsManager
ProfileManager
ProfileFactory
```

Физические имена файлов могут быть rust-idiomatic snake_case, но публичные типы и документационный язык сохраняют текущие имена.

---

## 2. Главный принцип миграции

Миграция не big-bang.

Сначала строится Rust backend v2 и oracle, которые параллельно повторяют текущие API-контракты. Старая Python-система остаётся рабочей до тех пор, пока Rust-результаты не совпадут с golden fixtures.

Порядок:

```text
сначала contract/golden tests
затем Rust oracle
затем Rust API совместимый с текущим JSON
затем SQLx/PostgreSQL
затем FlatBuffers endpoints
затем SSR/islands frontend
затем отключение Python/TS-дублей
```

---

## 3. Фаза A — заморозить текущие контракты

Цель: зафиксировать, что именно новый backend обязан повторить.

### A1. Golden fixtures для API

Создать corpus:

```text
tests/contracts/api/items_en_full.json
tests/contracts/api/items_ru_full.json
tests/contracts/api/items_en_limit100.json
tests/contracts/api/profile_minimal_response.json
tests/contracts/api/profile_full_response.json
tests/contracts/api/home_response.json
```

Команды:

```bash
python scripts/capture_contracts.py
python scripts/check_contracts.py
```

### A2. Golden fixtures для профилей

Зафиксировать входы:

```text
tests/fixtures/synthetic_profile_minimal.json
tests/fixtures/synthetic_profile_full.json
tests/fixtures/profile_unknown_items.json
tests/fixtures/profile_numbered_skins.json
tests/fixtures/profile_old_version.json
```

Особенно добавить regression cases:

- `Skin02`, `Skin03`;
- `install_version != actual_version`;
- unknown item policy;
- UID в root и UID внутри `Data`.

### A3. Golden fixtures для search/slug/image

Зафиксировать:

```text
slug(name) -> slug
item -> image_key
query -> AST
query -> result item ids
```

Это нужно до переписывания, чтобы Rust oracle не спорил с текущим поведением без явного решения.

---

## 4. Фаза B — Rust workspace skeleton

Предлагаемая структура:

```text
Cargo.toml
rust-toolchain.toml
crates/
  bi_oracle/
  bi_schema/
  bi_db/
  bi_api/
  bi_cli/
  bi_ssr/
  bi_islands/
xtask/
```

### B1. `bi_oracle`

Единственное место для доменных правил:

```text
slug
xp
area
rarity
profile parsing
profile analytics
item image key
recipe validation
search DSL
tooltip parser
safe html
localization validation
```

Публичные сущности:

```rust
pub struct ProfileFactory;
pub struct SlugService;
pub struct ItemIconService;
pub struct SearchTermService;
pub struct SecurityService;
```

### B2. `bi_schema`

FlatBuffers schemas:

```text
schemas/catalog.fbs
schemas/profile.fbs
schemas/search.fbs
schemas/localization.fbs
schemas/error.fbs
```

Первый этап: схемы есть, но текущий JSON API ещё сохраняется для совместимости.

### B3. `bi_db`

SQLx models/repositories/migrations.

Первый этап использует существующую PostgreSQL-схему максимально близко к текущей.

### B4. `bi_api`

Axum API, совместимый с текущим backend:

```text
GET  /
GET  /api/items
POST /api/profile
GET  /api/sitemap
GET  /sitemap.xml
GET  /robots.txt
```

### B5. `bi_cli`

Оракул для агента:

```bash
bi validate all
bi dump item wooden-sword
bi explain profile tests/fixtures/synthetic_profile_full.json
bi explain search "damage >= 10 & !poison"
bi check images
bi diff catalog old.fb new.fb
bi budget check
```

---

## 5. Фаза C — Rust oracle до backend rewrite

Цель: перенести чистую доменную логику без сервера.

Приоритет переноса:

1. Rarity enum and weights.
2. XP/level/area formulas.
3. SlugService.
4. ItemIconService.
5. ProfileFactory pure parser/analytics.
6. Search DSL parser.
7. Tooltip/icon parser.
8. SafeHtml/PlainText wrappers.

### C1. Newtypes

Запретить stringly domain:

```rust
ItemId
ItemName
Slug
ImageKey
ProfileUid
CatalogVersion
PlainText
SafeHtml
```

### C2. Typestate для профиля

```text
RawProfile
  -> ValidatedProfile
  -> AnalyzedProfile
  -> ProfileView
```

### C3. Тесты

- Snapshot tests через `insta`.
- Property tests через `proptest`.
- Fuzz targets для profile/search/tooltip parser.

---

## 6. Фаза D — Axum backend v2 с JSON-совместимостью

Цель: новый backend выдаёт тот же JSON, что старый.

### D1. Root route

```text
GET / -> {"message":"Backpack Insight API is running"}
```

### D2. Items route

```text
GET /api/items?lang=en
GET /api/items?lang=ru
GET /api/items?limit=100&offset=0&lang=en
```

На первом этапе response JSON должен быть совместим с текущим frontend.

### D3. Profile route

```text
POST /api/profile
```

Вход остаётся game JSON.
Выход остаётся текущий frontend JSON.

### D4. Known backend regressions to fix during rewrite

Обязательные исправления:

- numbered skins: `Skin02`, `Skin03`;
- `install_version` должен быть `IV`, а не копией `AV`;
- UID extraction должен работать и из root, и из `Data`;
- unknown item policy должна быть явной;
- profile upsert должен быть атомарным;
- content-length/body limit должен быть middleware-level;
- static item resync не должен удалять player inventory.

---

## 7. Фаза E — SQLx и БД

### E1. Миграции

Перевести схему в SQLx migrations:

```text
migrations/
  0001_initial.sql
  0002_profile_timestamps_and_indexes.sql
  0003_itemdefinition_localization.sql
```

Никаких runtime ALTER TABLE.

### E2. SQLx compile-time checking

Только:

```rust
sqlx::query!
sqlx::query_as!
```

Запретить dynamic SQL в обычном коде.

CI:

```bash
cargo sqlx prepare --check
```

### E3. Atomic upsert

PostgreSQL-native:

```sql
INSERT ... ON CONFLICT (user_id) DO UPDATE ...
```

Или транзакционный delete/insert без промежуточного commit, если нужна полная замена дочерних rows.

---

## 8. Фаза F — FlatBuffers data packs

Не делать один большой `catalog.fb`.

Целевые packs:

```text
catalog_summary.en.fb
catalog_summary.ru.fb
catalog_details.en.fb
catalog_details.ru.fb
search_index.en.fb
search_index.ru.fb
image_map.fb
rarity_meta.fb
localization.en.fb
localization.ru.fb
```

### F1. Compatibility endpoints

Сначала добавить рядом с JSON:

```text
GET /api/v2/catalog-summary.fb?lang=ru
GET /api/v2/search-index.fb?lang=ru
GET /api/v2/item-details/:slug.fb?lang=ru
```

### F2. Validators

```bash
bi fb verify
bi catalog validate
bi locales validate
bi recipes validate
bi images validate
```

---

## 9. Фаза G — dual-run сравнение Python и Rust

До переключения production:

```text
Python backend response
Rust backend response
  -> canonicalize
  -> diff
```

Команды:

```bash
bi compare api-items
bi compare profile tests/fixtures/*.json
```

Различия допускаются только в заранее утверждённом списке intentional fixes.

---

## 10. Фаза H — переключение backend

Порядок:

1. Поднять Rust backend на другом порту/container name.
2. Cloudflare/API proxy пока смотрит на Python.
3. Запустить shadow traffic/contract checks.
4. Переключить `/api/v2` на Rust.
5. Переключить `/api/*` на Rust.
6. Оставить Python backend как rollback на время.
7. Удалить Python backend после стабильного периода.

---

## 11. Фаза I — Leptos SSR Islands frontend

После backend/oracle стабилен.

Сохраняемые имена:

```text
Gen
Branch
BranchSpec
BranchRunner
Shell
ItemsBranch
ProfileBranch
ItemDetailBranch
NotFoundBranch
ItemsManager
ProfileManager
```

Новая роль:

```text
Gen           -> registry routes/islands/data packs/sitemap
Branch        -> typed trait/page unit
BranchSpec    -> route/meta/data/islands contract
BranchRunner  -> turns BranchSpec into Axum/Leptos routes
Shell         -> SSR layout
Manager       -> typed state/domain/island controller
Renderer      -> Leptos component or SSR fragment
```

### I1. Migration order

1. `NotFoundBranch` — simplest.
2. `ItemDetailBranch` — best SSR/SEO gain.
3. `MainBranch` — upload island.
4. `ItemsBranch` — hardest search/filter island.
5. `ProfileBranch` — profile interactivity/screenshot last.

---

## 12. Фаза J — удалить дубли и старые слои

После SSR/islands:

- убрать Cloudflare item SEO functions;
- убрать Bun server if Axum serves SSR/static;
- убрать duplicated slug functions;
- убрать duplicated image mapping;
- убрать JSON catalog endpoints only when frontend no longer uses them;
- оставить web-standard JSON artifacts generated, если браузер требует (`manifest.json`).

---

## 13. CI/Guard до 10/10

Одна команда:

```bash
bi guard full
```

Должна запускать:

```bash
cargo fmt --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo check --workspace --all-targets --all-features
cargo test --workspace
cargo sqlx prepare --check
bi schema check
bi catalog validate
bi images validate
bi recipes validate
bi locales validate
bi search validate
bi profiles validate-fixtures
bi fb verify
bi docs generate --check
bi sitemap generate --check
bi budgets check
bi visual test
```

---

## 14. Performance budgets

Создать `budgets.toml`:

```toml
[route.home]
initial_br_kb = 50

[route.items]
initial_br_kb = 160
interactive_extra_br_kb = 350

[wasm.items_search]
br_kb = 250

[wasm.profile]
br_kb = 220

[data.catalog_summary_ru]
br_kb = 100

[data.search_index_ru]
br_kb = 80

[css.global]
br_kb = 20
```

CI падает при превышении.

---

## 15. Первые практические задачи

1. Создать `rust_migration/` или сразу workspace skeleton.
2. Добавить `rust-toolchain.toml`.
3. Создать `crates/bi_oracle`.
4. Перенести `SlugService` и покрыть snapshot tests.
5. Перенести `ItemIconService` и проверить images.
6. Перенести XP/level/area formulas.
7. Создать первые `.fbs`: `catalog.fbs`, `profile.fbs`.
8. Создать `bi_cli dump/validate` skeleton.
9. Создать Axum `GET /` и `GET /api/items?limit=1` prototype.
10. Сделать contract compare against current Python backend.

---

## 16. Критерий завершения backend phase

Backend phase считается готовой, когда:

- Rust backend проходит текущие API contract tests.
- Rust backend исправляет утверждённые регрессии.
- SQLx migrations полностью заменяют runtime schema patching.
- `/api/items` и `/api/profile` работают с текущим frontend без изменений.
- `/sitemap.xml` отдаёт XML, а не SPA HTML.
- `bi validate all` зелёный.
- Python backend можно выключить без изменений frontend.


## Naming checkpoint — дендрическая корневая система

Пользователь уточнил: названия должны остаться тематическими, простыми и связанными с дендрической темой фронтенда. Поэтому backend в Rust-плане называется частью `RBackend/`, а не отдельным чужеродным `Backend v2`.

Принята первая схема имён:

```text
RBackend/                  Rust-workspace будущей корневой системы
core               корень доменных правил / oracle
cli                CLI-доступ к корню
будущий api        Axum API + SSR routes
будущий db         SQLx + migrations
будущие branches        Leptos SSR/islands страницы
```

Публичные архитектурные имена сохраняются:

```text
Gen
Branch
BranchSpec
BranchRunner
Shell
ItemsBranch
ProfileBranch
ItemsManager
ProfileManager
ProfileFactory
SlugService
ItemIconService
```

Первая контрольная точка: `RBackend/crates/core` с `SlugService` и `RBackend/crates/cli` с командой `slug`.


## Checkpoint 2 — ItemIconService в RBackend

Вторая контрольная точка добавляет в `RBackend/crates/core` доменный `ItemIconService` и тип `ImageKey`.

Перенесена текущая логика:

```text
MASKED_ITEMS
Special + Step N/IV -> heist-plan-N
default -> SlugService
```

`cli` получил команды:

```bash
cargo run -p cli -- image-key "Suspicious Sausage"
cargo run -p cli -- image-key --rarity Special --tooltip "Step IV: ..." "Any Plan"
cargo run -p cli -- check-images
```

`check-images` пока проверяет текущий plain JSON-каталог и существование `webp`/`avif` файлов. Это намеренно повторяет текущую проверку `npm run verify:images`, но уже через корневой Rust-oracle.


## Naming rule — backend без невкусных Factory-монолитов

Пользователь отдельно уточнил: старые ИИ-названия backend вроде `ProfileFactory` не нравятся. В Rust-корне не переносим это имя как монолит.

Правило для будущего backend/root-кода:

```text
не ProfileFactory
а маленькие простые модули по ответственности:

profile/types.rs
profile/read.rs
profile/check.rs
profile/level.rs
profile/area.rs
profile/items.rs
profile/heroes.rs
profile/view.rs
```

В текущей контрольной точке уже применено:

```text
profile/types.rs
profile/level.rs
profile/area.rs
```

То есть профильная логика растёт как маленькие корни, а не как один factory-монолит.

## Checkpoint 3 — XP, Level, Area в core

Третья контрольная точка добавляет профильную математику в `core`, но без монолита:

```text
profile/types.rs     Xp, PlayerLevel, PlayerArea, LevelProgress
profile/level.rs     LevelService
profile/area.rs      AreaService
```

CLI получил команды:

```bash
cargo run -p cli -- level --xp 123456
cargo run -p cli -- area --trophy 30000 --bonus 6394
```

Логика повторяет текущий backend:

```text
PROFILE_EXP_NEED
post-table 100_000 XP per level
PROFILE_AREAS
trophy + bonus trophy
```


## core boundary — не склад всех переменных

`core` не должен стать новым монолитом. Это только корень чистых доменных правил.

Разрешено:

```text
slug
image_key
XP / level / area
hero normalize / prestige / league
item leveling
search DSL
safe HTML
pure profile analysis
```

Запрещено:

```text
HTTP routes
SQLx queries
DB repositories
Leptos browser code
Docker/deploy config
large runtime caches
```

## Checkpoint 4 — Hero rules в core

Четвёртая контрольная точка добавляет hero-логику без монолита:

```text
profile/heroes/types.rs     Hero, HeroInput, HeroName, HeroLevel, HeroRating
profile/heroes/name.rs      HeroNameService
profile/heroes/level.rs     HeroLevelService
profile/heroes/league.rs    LeagueService
profile/heroes/mod.rs       HeroService как тонкая сборка
```

CLI получил команду:

```bash
cargo run -p cli -- hero --name Warrior --level-raw 25 --xp 0 --rating 5000
```

Логика повторяет текущий backend `Hero.from_entry`: raw level 0-based, prestige при уровне > 20, league по `rating / 500`, exp requirement через next level.


## Checkpoint 5 — Item leveling без Item-монолита

Пятая контрольная точка добавляет предметную математику без создания большого `Item`-god-object:

```text
profile/items/types.rs     ItemRarity, ItemLevel, Cards, ItemLevelInfo
profile/items/rarity.rs    RarityService
profile/items/cards.rs     CardsService
profile/items/xp.rs        ItemXpService
profile/items/mod.rs       ItemLevelService как тонкая сборка
```

CLI получил команду:

```bash
cargo run -p cli -- item-level --rarity Common --level 10 --cards 500
```

Логика повторяет текущий backend `Item.cards_need` и `Item.total_xp`, но остаётся compatibility layer. Позже, после декомпозиции игры, таблицы можно заменить настоящими игровыми правилами.


## Checkpoint 6 — Unlocks / skins / banners без ProfileFactory

Шестая контрольная точка добавляет разбор unlock-строк профиля маленькими корнями:

```text
profile/unlocks/types.rs     UnlockName, SkinUnlock, BannerUnlock, Unlocks
profile/unlocks/skins.rs     SkinService
profile/unlocks/banners.rs   BannerService
profile/unlocks/mod.rs       UnlockService как тонкая сборка
```

CLI получил команды:

```bash
cargo run -p cli -- unlock --value NymphedoraSkin02
cargo run -p cli -- unlock --value Season01Banner01
cargo run -p cli -- unlock --file tests/fixtures/synthetic_profile_full.json
```

Эта точка фиксирует известный регресс текущего backend: numbered skins вроде `Skin02` должны распознаваться.


## Checkpoint 7 — Profile check без ProfileFactory

Седьмая контрольная точка добавляет базовую проверку профиля маленьким модулем:

```text
profile/check.rs    ProfileCheckInput, ProfileCheckReport, ProfileIssue, ProfileCheckService
```

`core` не читает JSON напрямую. CLI читает текущий JSON и собирает минимальный `ProfileCheckInput`; сам корень проверяет доменное правило:

```text
Data exists
UID exists in root UID or Data.UID
Name exists
Hero or Item exists
```

CLI получил команду:

```bash
cargo run -p cli -- profile-check --file ../tests/fixtures/synthetic_profile_full.json
```

Это заменяет часть старого `ProfileFactory._validate_json`, но без переноса имени `ProfileFactory` и без нового монолита.


## Checkpoint 8 — Profile identity без ProfileFactory

Восьмая контрольная точка добавляет чтение идентичности профиля маленькими корнями:

```text
profile/identity/types.rs   ProfileUid, ProfileName, ProfileIdentity, ProfileIdentityInput
profile/identity/uid.rs     ProfileUidService
profile/identity/name.rs    ProfileNameService
profile/identity/mod.rs     ProfileIdentityService как тонкая сборка
```

Правило UID фиксируется явно:

```text
Data.UID имеет приоритет, если непустой
иначе используется root UID
```

CLI получил команду:

```bash
cargo run -p cli -- profile-id --file ../tests/fixtures/synthetic_profile_full.json
```

Это следующий шаг от `profile-check` к безопасному чтению профиля, без возврата к `ProfileFactory`-монолиту.


## Checkpoint 9 — Profile wallet без ProfileFactory

Девятая контрольная точка добавляет чтение базовой валюты профиля маленькими корнями:

```text
profile/wallet/types.rs   Coins, Gems, ProfileWallet, ProfileWalletInput
profile/wallet/read.rs    ProfileWalletService
profile/wallet/mod.rs     re-export
```

Правило совместимо с текущим backend/frontend:

```text
Currency.coins отсутствует -> 0
Currency.gems отсутствует -> 0
```

CLI получил команду:

```bash
cargo run -p cli -- profile-wallet --file ../tests/fixtures/synthetic_profile_full.json
```

Это следующий маленький шаг чтения профиля после `profile-id`, без возврата к `ProfileFactory`-монолиту.


## Granularity rule — делить по ответственности, а не по каждому полю

Пользователь уточнил: дробить даже каждую валюту на отдельный файл может быть избыточно. Правило уточнено:

```text
делим по ответственности и причинам изменения,
а не механически по каждому полю.
```

Если несколько значений почти всегда используются вместе и имеют одну причину изменения, они могут жить в одном маленьком модуле.

## Checkpoint 10 — Profile score сбалансированной гранулярностью

Десятая контрольная точка добавляет `profile/score.rs` одним маленьким модулем, без папки на каждое поле:

```text
Trophy
BonusTrophy
ProfileScoreInput
ProfileScore
ProfileScoreService
```

Логика:

```text
trophy + bonus_trophy -> total_trophies -> AreaService
```

CLI получил команду:

```bash
cargo run -p cli -- profile-score --file ../tests/fixtures/synthetic_profile_full.json
```


## Granularity audit after Checkpoint 10

Проведён аудит чрезмерной гранулярности. Исправлено избыточное дробление wallet:

```text
было:
profile/wallet/coins.rs
profile/wallet/gems.rs

стало:
profile/wallet/read.rs
```

Причина: coins и gems в текущем слое имеют одну ответственность — чтение базовой валюты с default-zero правилами. Делить их по одному полю было механическим дроблением.

Остальные разделения пока оставлены: hero name/level/league, item cards/xp, unlock skins/banners, identity uid/name имеют разные причины изменения и отдельные правила.


## Checkpoint 11 — Typed IDs и StringPool

Контрольная точка после первых двух пунктов performance/data плана:

```text
1. typed IDs
2. catalog/strings module
```

Добавлен маленький `catalog`-корень:

```text
catalog/ids.rs       ItemId, HeroId, StringId
catalog/strings.rs   StringPool
catalog/mod.rs       re-export
```

Это не полный DOD-каталог и не `CatalogColumns`. Это фундамент для будущего data-oriented представления и FlatBuffers: сначала безопасные ID-типы и string interning, потом колоночное хранение.

CLI получил команду:

```bash
cargo run -p cli -- intern "Wooden Sword" "Wooden Sword" "Apple"
```


## Checkpoint 12 — CatalogColumns как первый DOD-скелет

Двенадцатая контрольная точка добавляет первый data-oriented skeleton каталога:

```text
catalog/columns.rs    CatalogItemInput, CatalogColumns
```

Текущие колонки:

```text
item_ids:   Vec<StringId>
names:      Vec<StringId>
slugs:      Vec<StringId>
image_keys: Vec<StringId>
rarities:   Vec<ItemRarity>
strings:    StringPool
```

Это не финальная структура и не FlatBuffers. Это первый шаг от object-oriented `ItemDefinition` к колоночному хранению, где строки интернируются и строки каталога адресуются `ItemId`.

CLI получил команду:

```bash
cargo run -p cli -- catalog-summary
```


## Checkpoint 13 — api Axum skeleton

Тринадцатая контрольная точка начинает backend-first миграцию уже на серверном слое:

```text
api/src/main.rs
api/src/lib.rs
api/src/state.rs
api/src/routes/root.rs
api/src/routes/catalog_summary.rs
api/src/catalog/load.rs
```

Endpoints:

```text
GET /
GET /api/catalog-summary
```

`GET /` возвращает то же сообщение, что текущий Python backend.

`GET /api/catalog-summary` читает текущий plain JSON-каталог, строит `CatalogColumns` из `core` и отдаёт диагностическую сводку. Это пока не production API и не замена `/api/items`.


## Checkpoint 14 — api /api/items JSON compatibility

Четырнадцатая контрольная точка добавляет первый endpoint, похожий на текущий Python backend:

```text
GET /api/items?limit=&offset=&lang=
```

Новые файлы:

```text
api/src/catalog/files.rs
api/src/catalog/items_json.rs
api/src/routes/items.rs
```

Текущий слой намеренно является compatibility-boundary:

```text
читает существующие JSON-файлы
мержит items_en_5_1_0.json + items_ru_5_1_0.json
создаёт names_local/tooltips_local
применяет lang к name/tooltips
поддерживает limit/offset
```

Это временно. Позже `/api/items` должен читать FlatBuffers/source-of-truth packs, а не raw JSON.


## Checkpoint 15 — api POST /api/profile-summary

Пятнадцатая контрольная точка добавляет безопасный диагностический профильный endpoint:

```text
POST /api/profile-summary
```

Новые файлы:

```text
api/src/profile/json_input.rs
api/src/profile/summary.rs
api/src/profile/mod.rs
api/src/routes/profile_summary.rs
```

Endpoint принимает текущий game JSON и собирает summary через маленькие корни `core`:

```text
ProfileCheckService
ProfileIdentityService
ProfileWalletService
ProfileScoreService
UnlockService
```

Это не замена `/api/profile` для frontend. Это диагностический мост для backend-first миграции, чтобы постепенно собрать полный профильный ответ без нового `ProfileFactory`-монолита.


## Checkpoint 16 — api POST /api/profile минимальный frontend-like ответ

Шестнадцатая контрольная точка добавляет первый endpoint с production-именем:

```text
POST /api/profile
```

Новые файлы:

```text
api/src/profile/view.rs
api/src/routes/profile.rs
```

Endpoint пока собирает только маленькие уже перенесённые части:

```text
ProfileCheckService
ProfileIdentityService
ProfileWalletService
ProfileScoreService
UnlockService
LevelService placeholder на 0 XP
```

Ответ имеет frontend-like форму, но пока с пустыми:

```text
heroes
items
item_stats
```

Это осознанный промежуточный слой: герои, предметы, XP и item_stats будут добавляться отдельными маленькими корнями, без возвращения к `ProfileFactory`.


## Checkpoint 17 — Heroes в api /api/profile

Семнадцатая контрольная точка добавляет героев в минимальный frontend-like `POST /api/profile`.

Новый файл:

```text
api/src/profile/heroes.rs
```

Разделение ответственности:

```text
core::HeroService      чистая hero-логика
api/profile/heroes.rs  JSON boundary + frontend response shape
api/profile/view.rs    добавление heroes/heroes_count в профильный ответ
```

Входной формат совместим с текущим JSON игры:

```text
"Hero": { "Warrior": "14:3151:3281" }
```

Выходной формат совместим с текущим frontend hero object:

```text
name, level, rating, experience, exp_req, prestige, league, skin_num
```


## Checkpoint 18 — Items в api /api/profile

Восемнадцатая контрольная точка добавляет предметы в frontend-like `POST /api/profile`.

Новый файл:

```text
api/src/profile/items.rs
```

Разделение ответственности:

```text
core::ItemLevelService      чистая item-level математика
api/profile/items.rs        JSON boundary + catalog lookup + response shape
api/profile/view.rs         добавление items/items_count/item_stats/profile level
```

Входной формат совместим с текущим JSON игры:

```text
"Item": { "Wooden Sword": "5:200" }
```

Выходной формат совместим с текущим frontend item object:

```text
name, rarity, level, cards, cards_need
```

После этой точки `items`, `items_count`, `item_stats` и профильный `level/xp_current/xp_need` больше не являются пустыми placeholder-ами: они считаются по перенесённой compatibility item XP формуле.


## Checkpoint 19 — Profile contract compare

Девятнадцатая контрольная точка добавляет миграционный сравнитель:

```text
scripts/compare_profile_contract.py
```

Он сравнивает ответы:

```text
Python backend  POST /api/profile
Rust api   POST /api/profile
```

на одинаковых fixture JSON.

Цель — сделать совместимость измеряемой. Следующие шаги должны не на глаз переносить `ProfileFactory`, а уменьшать конкретный diff между старым и новым endpoint.


## Checkpoint 20 — Deep profile contract compare

Двадцатая контрольная точка расширяет `scripts/compare_profile_contract.py`:

```text
intentional diff allowlist
install_version по умолчанию intentional
heroes deep compare by name
items deep compare by name
order warnings отдельно
--strict-order для будущего строгого режима
```

Это делает совместимость `/api/profile` измеримой глубже, чем top-level counts.


## Checkpoint 21 — Items contract compare

Двадцать первая контрольная точка добавляет миграционный сравнитель:

```text
scripts/compare_items_contract.py
```

Он сравнивает ответы:

```text
Python backend  GET /api/items
Rust api   GET /api/items
```

на одинаковых query.

Проверяются status, list shape, length, id set, selected fields, key sets и order warnings. Это нужно до точного выравнивания `/api/items`, потому что endpoint тяжёлый и влияет на весь каталог.


## Checkpoint 22 — /api/items parity fix + sitemap/robots

Эта точка объединяет два backend-only шага, чтобы не делать слишком мелкий ход:

1. Исправлен compatibility JSON `/api/items`: Rust больше не отдаёт raw-поле `embargoed`, которое отсутствует в Python response.
2. Добавлены backend SEO endpoints в `api`:

```text
GET /sitemap.xml
GET /api/sitemap
GET /robots.txt
```

Новые файлы:

```text
api/src/seo/sitemap.rs
api/src/seo/robots.rs
api/src/seo/mod.rs
api/src/routes/sitemap.rs
api/src/routes/robots.rs
```

Цель: закрыть найденный production bug `/sitemap.xml -> HTML` и продвинуть backend parity без перехода к frontend.


## Checkpoint 23 — Backend parity layer

После замечания о слишком мелких точках контрольные точки укрупняются.

Эта точка закрывает backend parity layer:

```text
GET /
GET /health
GET /ready
GET /api/items
POST /api/profile
GET /sitemap.xml
GET /api/sitemap
GET /robots.txt
```

Добавлены:

```text
routes/health.rs
docs/RBackend/backend_parity_layer.md
docs/RBackend/contract_intentional_diffs.md
```

Проверяются contract compare scripts для profile/items и basic operational endpoints health/ready/sitemap/robots.


## Checkpoint 24 — Backend hardening layer

Эта точка закрывает backend hardening layer для `api`:

```text
API secret middleware
production fail-closed без секрета
body size limit до JSON parsing
CORS config
basic trace layer
единая JSON error schema для middleware
```

Новые файлы:

```text
api/src/error.rs
api/src/security/mod.rs
api/src/security/secret.rs
```

Обновлены `AppState`, router assembly и зависимости `tower-http`.


## Checkpoint 25 — Data source layer foundation

Эта точка начинает data source layer:

```text
RBackend/schemas/catalog.fbs
RBackend/schemas/profile.fbs
RBackend/schemas/search.fbs
RBackend/schemas/localization.fbs
RBackend/schemas/error.fbs
RBackend/crates/builder
```

`builder` добавляет команды:

```bash
cargo run -p builder -- validate-catalog
cargo run -p builder -- check-images
cargo run -p builder -- check-locales
cargo run -p builder -- validate-all
cargo run -p builder -- build-catalog-preview
```

Пока `build-catalog-preview` пишет JSON preview pack, не финальный FlatBuffer. Это намеренный этап: сначала схемы и валидаторы, затем подключение flatc и настоящих `.fb` packs.


## Checkpoint 26 — First real FlatBuffer catalog pack

Эта точка добавляет первый настоящий бинарный FlatBuffer artifact для catalog summary:

```text
RBackend/generated/catalog_summary.fb
```

Новые команды `builder`:

```bash
cargo run -p builder -- build-catalog-flatbuffer
cargo run -p builder -- verify-flatbuffer
```

`build-catalog-flatbuffer` строит JSON под `RBackend/schemas/catalog.fbs`, вызывает внешний `flatc` и создаёт `.fb`.

`verify-flatbuffer` пока делает минимальную проверку file identifier `BICS`. Runtime-чтение `.fb` в `api` будет отдельной backend-точкой.


## Checkpoint 27 — Runtime catalog pack layer

Эта точка делает первый `.fb` pack runtime-читаемым:

```text
RBackend/crates/pack
RBackend/crates/pack/src/generated/catalog_generated.rs
build verify-flatbuffer через pack
api /api/catalog-summary читает RBackend/generated/catalog_summary.fb, если он существует
```

`api` сохраняет fallback на raw JSON, чтобы dev-сервер работал без предварительного build-catalog-flatbuffer.

`/api/items` пока остаётся JSON compatibility layer; переключение `/api/items` на pack-backed источник — следующий backend слой.


## Checkpoint 28 — Pack-backed /api/items compatibility packs

Эта точка делает `/api/items` pack-backed, если сгенерированы compatibility packs:

```text
RBackend/generated/api_items_en.fb
RBackend/generated/api_items_ru.fb
```

Добавлены:

```text
RBackend/schemas/api_items.fbs
RBackend/crates/pack/src/api_items.rs
RBackend/crates/builder/src/catalog/api_items_flatbuffer.rs
```

`api /api/items` теперь сначала пытается читать pack по `lang`, и только если pack отсутствует — использует raw JSON fallback.

Важно: pack пока хранит item JSON строками. Это compatibility layer для отключения Python backend без frontend rewrite. Позже он должен быть заменён typed details pack.


## Checkpoint 29 — Binary FlatBuffer API endpoints

С учётом решения, что middleware frontend-side считается частью backend, JSON compatibility больше не является целевым контрактом.

Добавлены binary endpoints:

```text
GET /api/items.fb?lang=en|ru
GET /api/catalog-summary.fb
```

Они отдают готовые `.fb` packs из `RBackend/generated`. Старые JSON endpoints остаются только legacy/dev и для contract compare, но новый backend→middleware контракт должен идти через `.fb`.


## Checkpoint 30 — Binary /api/profile.fb

Добавлен binary profile endpoint:

```text
POST /api/profile.fb
```

Вход остаётся пользовательским JSON-профилем. Выход:

```text
ProfileView FlatBuffer  BIPR
ApiError FlatBuffer     BIER
```

Это первый полноценный шаг к отказу от JSON backend→middleware profile contract. Legacy `/api/profile` остаётся для debug/dev до завершения middleware перехода.


## Checkpoint 31 — Backend-owned middleware decoder crate

Добавлен crate:

```text
RBackend/crates/middleware
```

Он декодирует бинарные backend contracts:

```text
items.fb   -> ItemsData / ItemData
profile.fb -> ProfileData / HeroData / ProfileItemData
error.fb   -> ErrorData
```

Этот слой считается частью backend, даже если позже будет компилироваться в WASM или использоваться frontend integration. Он не делает HTTP и не читает raw JSON; вход — только FlatBuffer bytes.


## Checkpoint 32 — Pack-only production mode

Добавлен режим, где production backend→middleware contract только бинарный:

```text
ROOT_ENV=production
ROOT_DATA_MODE=pack
ROOT_LEGACY_JSON=false
```

В production по умолчанию:

```text
legacy JSON endpoints disabled
raw JSON fallback disabled
.generated packs required
```

Основные endpoints:

```text
GET  /api/items.fb
GET  /api/catalog-summary.fb
POST /api/profile.fb
```

JSON остаётся только как input: исходные файлы разработчиков для builder и пользовательский profile upload.


## Checkpoint 32 — Production pack-only Docker replacement

Добавлен production слой для RBackend как замены Python backend на том же порту 8000:

```text
RBackend/Dockerfile
ROOT_PROJECT_ROOT support
pack verification at startup
docker-compose backend -> RBackend/Dockerfile
docker-compose.server backend -> RBackend/Dockerfile
```

Docker build создаёт `.fb` packs через `builder`, затем собирает release `api`. Runtime запускает только Rust binary и содержит только generated packs.

Production defaults:

```text
ROOT_ENV=production
ROOT_DATA_MODE=pack
ROOT_LEGACY_JSON=false
ROOT_API_ADDR=0.0.0.0:8000
```


## Checkpoint 33 — RBackend Docker replacement on same backend port

Добавлен `RBackend/Dockerfile` и compose backend service переключён на Rust backend без смены внешнего порта/имени контейнера:

```text
container_name: backpack_insight_backend
port: 8000
Dockerfile: RBackend/Dockerfile
```

Build stage запускает тесты, data validation и build-all-packs. Runtime содержит только release `api` binary и generated `.fb` packs.

Local compose оставляет `ROOT_LEGACY_JSON=true` для старого frontend во время миграции. Server compose использует `ROOT_ENV=production`, `ROOT_DATA_MODE=pack`, `ROOT_LEGACY_JSON=false`.


## Checkpoint 32 — SQLx profile persistence layer

Добавлен crate:

```text
RBackend/crates/db
```

Текущий scope:

```text
PostgreSQL pool
SQLx migrations
profiles table
atomic upsert by uid
profile FlatBuffer bytes stored as BYTEA
```

RBackend `api` подключает DB, если `ROOT_DB_ENABLED=true` или заданы `DATABASE_URL`/`POSTGRES_SERVER`. В `/api/profile.fb` успешный профиль сохраняется как бинарный `profile_fb`, без хранения raw user JSON.


## Checkpoint 34 — Remove legacy JSON runtime endpoints

Удалены legacy JSON endpoints из `api` router:

```text
GET /api/items
GET /api/catalog-summary
POST /api/profile
POST /api/profile-summary
```

Остаются бинарные/не-JSON endpoints:

```text
GET /api/items.fb
GET /api/catalog-summary.fb
POST /api/profile.fb
GET /sitemap.xml
GET /api/sitemap
GET /robots.txt
GET /health
GET /ready
```

`/`, `/health`, `/ready` переведены на text/plain. Ошибки API secret для binary routes возвращают `ApiError` FlatBuffer.

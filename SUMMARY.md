# BackpackInsight — Summary of the branch analysis thread

Summary of the Claude thread "Анализ веток BackpackInsight" (2026-10-01 → 2026-10-06), closed 2026-10-06. It replaces the earlier `LEGACY.md` handoff and condenses the Russian analysis reports in `/mnt/project-files/reports/branches-2026-10-01/` (§12). Repo state as of `rust-leptos@2d51f58`.
Everything below was checked against the git remote on 2026-10-06 unless marked *(inferred)* or *(from earlier reports)*.
Language rule (Иван, 2026-10-06): **talk to Иван in Russian**. English only for machine-readable files meant for Claude (this file, handoff notes, memory) that he is unlikely to read.

---

## 0. TL;DR for the next agent

- Repo: `https://github.com/RedOrkGreenRox/BackpackInsight` (public). Owner: Иван (GitHub `RedOrkGreenRox`).
- Three live branches matter: `main` (Python, production), `Rustified` (orphan, Rust backend by an earlier AI "Arena"), `rust-leptos` (ALL our new work, PR #4 → `Rustified`, CI green, waiting for Иван's review).
- Goal: the whole site in Rust. Backend = Axum workspace `RBackend/`. Frontend = Leptos 0.8 SSR + islands (crate `RBackend/crates/branches`), keeping Иван's **dendritic architecture** (Gen / Shell / Branch / BranchSpec / BranchRunner, pages = `*Branch`, islands = `*Manager`).
- Nothing new is deployed. Production deploys only on push to `main` (`.github/workflows/deploy.yml`). The Pages proxy for the Leptos server is gated by `LEPTOS_SSR=true` (off).
- Next concrete blocker before any switch: `RBackend/Dockerfile` must build/run the `branches` server (see §7.1).
- Biggest next feature: the **Item Field** (Иван's own grid design, §6). Build it only from his description; ask about gaps.
- Hard rules: no subagents/workflows (quota), no history rewrites without his command, files ≤150 lines, a mirror `.md` in `docs/` for every source file, keep the old look, no full-page reloads, item names are never translated.

---

## 1. Machine-readable repository map

```yaml
repository:
  url: https://github.com/RedOrkGreenRox/BackpackInsight
  visibility: public
  owner: RedOrkGreenRox   # Иван
  product: "BackpackInsight — fan site for a backpack-battler game: player profile showcase + item encyclopedia (catalog). Promised analytics (combat mechanics, builds, simulation) do not exist yet in any branch."
  hosting:
    edge: Cloudflare Pages (*.pages.dev, no custom domain) — HTTPS + protection only
    origin: Иван's own VPS (Docker Compose), reached by Pages Functions with header X-Internal-Secret
    production_source: branch selected in Pages settings (main, inferred) + VPS deploy on push to main
  size_note: "~100 MB of item images committed without Git LFS"

branches:
  main:
    head: 3eec7d2
    commits: 219
    role: production
    tracked_files: 3632
    stack:
      backend: Python 3, FastAPI, SQLModel, Alembic, PostgreSQL 15 (SQLite for dev/tests)
      frontend: Vite + TypeScript + SCSS, served by a Bun server (Frontend/Web/server.ts) in Docker; Cloudflare Pages Functions in Frontend/Web/functions
    layout:
      Backend/DB: database.py, bootstrap.py, reset_db.py, migrations/versions/{0001_initial_schema,0002_profile_indexes_and_timestamps}.py
      Backend/PlayerData: api.py (FastAPI app), data.py, constants.py, utils.py, models/{Hero,Item,Profile}.py, services/ProfileFactory.py, builds/icon_parser.py, Profiles/ (player data — PII)
      Frontend/Web: index.html, ground/ (TS+SCSS source, dendritic tree: roots/, branches/{main,items,profile,404}/, utils/), functions/, static/ (images, lang JSON), tests/ (vitest), vite.config.ts
      root: docker-compose.yml, docker-compose.server.yml, alembic.ini, pytest.ini, update.ps1, REQUIREMENTS.md, docs/, scripts/, tests/
    api:
      - GET /                      # health message
      - GET /api/items             # catalog JSON (lang, limit, ...)
      - POST /api/profile          # parse uploaded game export into a profile view
    tests_baseline: {pytest: "92 passed, 72% coverage", vitest: "36/36"}

  Rustified:
    head: f74b924
    commits: 1 visible on remote as a squashed orphan history (earlier analysis counted 11 local commits by "patch <patch@local>"; first commit 7cda9d8 = snapshot of main@3eec7d2)
    role: target branch of the Rust migration (will become the site's main branch once migration is complete — Иван, 2026-10-01)
    tracked_files: 3529
    adds_over_main: [RBackend/, rust-toolchain.toml, rust_migration_plan.md]
    removes_vs_main: [alembic.ini, pytest.ini, docker-compose.server.yml]   # Python Backend/ is still present
    tests_baseline: {cargo: "105 tests (7 skip without data packs)", vitest: "30/31"}

  rust-leptos:
    head: a915953
    base: Rustified
    commits_over_base: 27
    diff_vs_base: "558 files changed, +14231 / -11030"
    pull_request: {number: 4, target: Rustified, state: open, ci: green, reviewer: Иван}
    tracked_files: 3820
    contents: "docs mirror + docs linter rewrite, api crate refactor, new Leptos crate `branches`, lazy islands, Pages proxy"

  stale_branches_to_delete_by_owner: [rustified-docs-mirror, rustified-leptos-branches, leptos-lazy-islands]   # session got HTTP 403 on delete
  closed_prs: [1, 2, 3]   # superseded by #4, never merged

rbackend_workspace:   # as on rust-leptos
  path: RBackend/
  edition: "2021"
  lints: {unsafe_code: forbid, clippy_unwrap_used: warn, clippy_expect_used: warn}
  release_profile: {lto: fat, codegen-units: 1, strip: symbols}
  wasm_profile: {name: wasm-release, opt-level: z, panic: abort}
  crates:
    core:       {rs_files: 39, role: "domain rules: strict game-export catalog model (CatalogExport/ItemDef), typed IDs, StringPool, XP/Level/Area, heroes, item leveling, unlocks, profile check/identity/wallet/score, CatalogColumns (data-oriented)"}
    pack:       {rs_files: 10, role: "FlatBuffers data packs (items, catalog summary, profile)"}
    builder:    {rs_files: 9,  role: "builds packs/catalog from source JSON"}
    db:         {rs_files: 3,  role: "sqlx Postgres/SQLite access + migrations"}
    middleware: {rs_files: 4,  role: "shared Axum middleware"}
    cli:        {rs_files: 1,  role: "command-line entry for build/maintenance tasks"}
    api:        {rs_files: 24, role: "Axum API server (binary `api`)"}
    branches:   {rs_files: 39, role: "Leptos SSR + islands website (binary `branches`, lib for WASM)"}
  api_routes:
    - GET /
    - GET /health
    - GET /ready
    - GET /api/items.fb
    - GET /api/catalog-summary.fb
    - POST /api/profile.fb
    - GET /api/sitemap
    - GET /sitemap.xml
    - GET /robots.txt
  api_exports_for_ssr: ["routes() without '/'", require_api_secret, shutdown_signal]   # commit 05869f9

branches_crate:   # RBackend/crates/branches — the Leptos site
  leptos: "0.8.21 (islands, islands-router)"
  leptos_axum: "0.8.10"
  cargo_leptos: "0.3.10"
  features: {server: ssr, client: hydrate}
  metadata: {name: backpack-insight, site-root: target/site, site-pkg-dir: pkg, style-file: crates/branches/style/site.scss, site-addr: "127.0.0.1:3000"}
  build: "cargo leptos build --release --split"     # --split is REQUIRED
  run: "target/release/branches (needs target/site and Frontend/Web/static)"
  pages:
    - {branch: MainBranch,     path: "/",       islands: [],               note: "home: 'Profile Showcase' title + export upload zone (upload logic not yet ported)"}
    - {branch: ItemsBranch,    path: "/items",  islands: [ItemsManager],   note: "catalog: SSR first 48 cards, live search, 'show more', state in URL; ItemsManager is lazy"}
    - {branch: EditorBranch,   path: "/editor", islands: [],               note: "empty placeholder 'Редактор' requested by Иван"}
    - {branch: NotFoundBranch, path: "/404",    islands: [],               note: "404 page"}
  i18n: [en, ru]   # language switch swaps text in place with a short blur, no reload
  src:
    lib.rs: "crate root; hydrate() entry calls prefetch_lazy_islands"
    main.rs: "server entry, returns ExitCode, logs errors with Display"
    model.rs: "shared view models"
    roots/:
      gen.rs: "Gen — route registry of all branches"
      branch.rs: "Branch trait: head() + render(); no lifecycle"
      spec.rs: "BranchSpec {name, path, islands, sitemap}"
      runner.rs: "BranchRunner — builds the Axum router; calls LazyIslands::load(&options)? at startup"
      shell.rs: "Shell — the one document layout; draws <head> in a fixed shape"
      head.rs: "PageHead {section(), site(), tags(indexable)} — title/description/robots on every page"
      lazy.rs: "LazyIslands::load -> Result<(), UnsplitBuild>; LazyIslands::links(islands)"
      split_files.rs: "SplitFiles {js, manifest, loader}; resolves hashed names via the hash file (keys js/manifest/split); 2 tests"
      chrome.rs, backdrop.rs: "page chrome and background"
      ctx.rs, request.rs: "request context"
      i18n.rs, per_lang.rs: "translations and per-language data"
    shell/: {mod.rs: "", sidebar.rs: "slide-out side menu (old design)", parallax.rs: "parallax background", prefetch.rs: "idle prefetch of unused lazy chunks (hydrate only)"}
    branches/: {main/, items/: [branch.rs, card.rs, manager.rs, scroll.rs, search_fn.rs, url.rs, mod.rs], editor/, not_found/}
    catalog/: [item.rs, load.rs, rarity.rs, search.rs, mod.rs]   # reads RBackend/generated/items_{en,ru}.json into rbackend_core::ItemDef (no pack crate)
  style: "SCSS ported from Frontend/Web/ground, same dendritic folders (roots/_roots/shell/{sidebar,navigation,parallax}, branches/{main,items,404})"

cloudflare_pages_functions:   # Frontend/Web/functions on rust-leptos
  "[[path]].ts": "catch-all proxy to the Leptos server; active only if env LEPTOS_SSR == 'true'; skips /images/ /fonts/ /lang/ and a few static files; returns 503 'RBackend offline' on fetch failure"
  "api/[[path]].ts": "API proxy to the backend with X-Internal-Secret"
  "api/item/[id].ts": "item API"
  "api/sitemap.ts": "sitemap"
  "item/[id].ts": "SEO page for one item"
  "utils/seo-utils.ts": "SEO helpers (has a reflected XSS, see §7.3)"

ci:
  ".github/workflows/deploy.yml": "on push to main ONLY: SSH to VPS, git reset --hard origin/main, docker compose up"
  ".github/workflows/docs.yml": "runs scripts/check_docs.py (docs linter) — added on rust-leptos"
  external_reviewers_seen_on_github: [Codex (PR comments), SonarQube (quality gate passed, 17 issues not inspected)]

docs_system:
  law: "every source file has a mirror .md under docs/ with the same path (REQUIREMENTS.md); files ≤150 lines"
  mirror_docs_on_rust_leptos: 626
  linter: "scripts/check_docs.py + scripts/docs_lint/ package"
  checks: [LINKS, TREE, FRESH, MIRROR, STRUCT, COMPLETE, TRUTH]
  structure_map: "scripts/generate_structure.py (reads git-tracked files)"
  last_result: "0 errors, 75 warnings"
```

---

## 2. Product goal and context

- The site is first of all **an experiment in building a website** (Иван): unusual, ambitious engineering is welcome.
- Today it is a profile showcase (upload a game export → see your profile) plus an item encyclopedia. The analytics that the name promises do not exist anywhere yet.
- Suggested product steps (report 06): explain the home page, export instructions (postponed by Иван), a sample profile, lazy-loaded profile items, then first analytics: "what to upgrade next", profile comparison, history.
- The live site is out of date; judge the project from the repo, not from production.

## 3. Decisions made by Иван (binding)

| Date | Decision |
|---|---|
| 2026-10-01 | `Rustified` becomes the main branch once the Rust migration is fully complete. |
| 2026-10-01 | The Telegram bot token in `main` history (commit `5df5953`) was revoked long ago. Nothing to do. |
| 2026-10-02 | Move everything to Rust; frontend on Leptos; TypeScript only as a last resort. |
| 2026-10-02 | Keep the dendritic architecture and its terms (roots, branches, Gen, Shell, Branch, BranchSpec, BranchRunner, `*Branch`, `*Manager`). |
| 2026-10-02 | Port the old design faithfully (slide-out side panel, home = "Profile Showcase" + upload zone). No redesign without asking. |
| 2026-10-02 | No control may reload or re-render the whole page. Language switch = short blur + in-place text swap. |
| 2026-10-02 | Item names stay English in every locale (that is how the game does it). |
| 2026-10-02 | Max strictness for Rust and TS + linters; DRY, Clean Code, SOLID/SRP, modularity, DDD where reasonable. |
| 2026-10-02 | Mirror docs stay (the approach is right; the earlier AI just failed to write them). |
| 2026-10-02 | Wanted: empty "Editor" page, per-page lazy WASM islands, Pages proxy for the new server. (All done.) |
| 2026-10-02 | Item grid = the Item Field design (§6); it replaces a separate item detail page. |
| 2026-10-03 | One branch for all work (`rust-leptos`), not many. |
| 2026-10-04 | New chat instead of this thread; this handoff file in English. |
| 2026-10-06 | Chat with Иван stays in Russian; English only for machine-readable files for Claude (replaces a short-lived 2026-10-04 "English only" rule). |
| 2026-10-06 | Phases G (Python/Rust dual run) and H (staged backend switch) are removed from `rust_migration_plan.md`; he never wanted them. |
| 2026-10-06 | Filters and sort exist conceptually in the old TS site, but their UX is bad; that is what "unfinished" means. |
| 2026-10-06 | Item catalog data format: the game's JSON export read into a strict Rust model (`rbackend_core::CatalogExport` / `ItemDef`, `deny_unknown_fields`). Not static JSON on Pages, not typed FlatBuffers. The site no longer reads `.fb` packs. |

Working rules for agents: no subagents or workflows (quota); no git history rewrites without his command; don't switch production; send short progress updates during long work; put results in the reply text itself, not only in files.

## 4. Hosting topology

```
Browser ──HTTPS──> Cloudflare Pages (*.pages.dev)
                    ├─ static files (images, fonts, lang JSON)
                    ├─ Functions: /api/* , /item/:id  ──X-Internal-Secret──> VPS backend
                    └─ Functions: [[path]].ts (LEPTOS_SSR=true only) ─────────> VPS `branches` server
VPS (Docker Compose): today Python FastAPI + Postgres (+ Bun web) from main.
```

A server binary for Leptos SSR is not a new cost: the VPS already exists. Any new scheme must keep working behind `pages.dev`.

## 5. The rework plan

### 5.1 Original plan (`rust_migration_plan.md` on Rustified, Russian, started 2026-07-06)

| Phase | Content | Status (2026-10-06) |
|---|---|---|
| A | Golden fixtures for API, profiles, search/slug/image | Not done (A1 missing) |
| B | Rust workspace skeleton | Done (crates differ in names from the plan: core/pack/builder/db/middleware/cli/api) |
| C | Rust oracle: newtypes, profile typestate, tests | Partly: newtypes yes, typestate no |
| D | Axum backend v2 with JSON compatibility | Partly: binary FlatBuffers routes exist; JSON compatibility checkpoints 14–17 recorded |
| E | SQLx + DB migrations, atomic upsert | Partly; migration conflicts with the old DB (see §7.3) |
| F | FlatBuffers data packs + validators | Partly; packs are 4.07 MB vs 1.2 MB JSON; validators check the wrong file |
| G, H | Dual-run and staged backend switch | **Removed from the plan by Иван (2026-10-06)** |
| I | Leptos SSR + islands frontend | **Largely done on `rust-leptos`** (home, catalog, editor, 404, i18n, lazy islands) |
| J | Remove duplicates and old layers | Not done |
| CI/Guard, perf budgets | | Docs CI done; Rust CI not yet |

Overall backend migration was ~35–40% done when analysed on 2026-10-01; phase I moved a lot since.

### 5.2 Our adjusted plan (what we actually do now)

1. Land PR #4 into `Rustified` (Иван reviews).
2. Make the `branches` server deployable (Dockerfile, compose service, env) — §7.1. Then a test switch of `LEPTOS_SSR` on a preview, never production without his word.
3. Build the **Item Field** (§6) as the shared item list component for catalog and profile.
4. Full search + filters + sort with all state in the URL. The old TS site already has them conceptually (rich query syntax, filter chips, sort), but Иван finds the UX bad (2026-10-06): keep the concept, redesign the UX, ask him what bothers him. The Leptos version has only simple search.
5. Profile branch: upload of the game export, profile view (heroes grid, header), lazy profile items.
6. Editor page content (still undefined — ask Иван).
7. ~~Decide data format~~ Done 2026-10-06: strict Rust model over the game JSON (§3). Remaining: move the api crate's profile parsing and sitemap off `api_items_*.fb`, then drop the generic packs with the TS frontend (phase J).
8. Finish backend phases A/C/E/F (G/H are dropped), then delete Python and the TS frontend (phase J), then make `Rustified` the main branch.
9. Product: first analytics features (§2).
10. Optional idea: one typed `project.toml` for all project settings (§9).

## 6. Item Field — Иван's design spec (2026-10-02, rough, may be incomplete)

- Used for every item list (catalog and profile), one component.
- A grid of "islands" (item tiles), 5 columns on desktop, fewer on phones; 3–4 rows visible.
- Islands within a radius of 2 islands from the pointer stretch and grow toward the mouse (also on tap).
- Clicking an island zooms the "camera" to it. It and its neighbours switch from **small** to **medium** form (medium shows the item's effect text). Neighbours stay visible at the screen edges and stay reactive.
- Recipes, the star-shaped grid and level progression expand the selected island to a **detailed** form, pushing the lower neighbour away.
- Navigation to one of up to 8 neighbours: click, swipe, arrow keys, WASD — with a short animation. Clicking the dimmed background zooms out.
- Search and filters sit above the grid; the grid shows only matching items.
- Must be accessible (keyboard, screen readers, reduced motion).
- The opened item, search and filters are all reflected in the URL.
- It replaces the separate item detail page. An earlier guess (plain overlay) was wrong: build only from this text and ask Иван about every gap.

## 7. Current state (2026-10-06)

### 7.1 Open work and known gaps

- **Dockerfile (Codex P1 on PR #4):** `RBackend/Dockerfile` still builds and runs only `api`. It must build with `cargo leptos build --release --split` and run `branches` with `target/site` and `Frontend/Web/static` before `LEPTOS_SSR` is turned on. Acknowledged on the PR; Иван has not scheduled it.
- **SonarQube:** gate passed, 17 issues not reviewed (4 from old PR #1, 13 from old PR #2).
- **Leptos site gaps:** no advanced filters/sort, no Item Field, no profile page, the home upload form is static markup with no logic, the editor is an empty placeholder. Item detail is covered by the Item Field's detailed form, not a separate page.
- **Data:** 110 of 1139 items (7.0.0 export) have no image yet; the site shows a placeholder. Another thread is building an `art` crate (image pipeline from the ContentKits in project files).
- **Rough completion estimate (2026-10-06, judgement, not a measurement):** ~50% of the plan after dropping G/H; Leptos UI ~45%.
- **Static artifact** of the site: https://claude.ai/artifact/8QVMTs2gpPLjDb36uCFUX7 (start page = Home). Buttons don't work there — most likely the artifact sandbox blocks WASM *(inferred, not verified)*. Locally the same build works. Old artifact `Xi2x7h2HdXwQGwUiVeF97p` is outdated.

### 7.2 Commits on `rust-leptos` (over Rustified), oldest → newest

```
6ed8bca 9ba2227 813a846 a38a941 244c67e 191caac 0ff63cd 2fd7433 a018c5f 06e58a8 0eb6fa0 eda4f20  docs: rewrite all mirror docs from the sources
c1f9352 664cb59 a9513ea e76ae9b  docs: mirror docs for SQL, FlatBuffers, Cargo, Pages files; split oversized doc
6ff123d b7cb04f                   scripts: check_docs rewritten as docs_lint package + CI; structure map from git
05869f9                           api: routes() without '/', require_api_secret, shutdown_signal
c6b11bd                           branches: Leptos SSR + islands frontend with dendritic roots
9631d9b                           pages: catch-all proxy behind LEPTOS_SSR
4ce82a7 1721c52                   docs for branches crate; drop unused leptos_router
beb9e9c                           branches: head tags drawn by the shell in one fixed shape
644a96a                           branches: lazy ItemsManager island with WASM split
a915953                           branches: resolve hashed split file names for lazy islands
671fe1a 475159d                   docs: LEGACY.md handoff, language rule
3d87bcb 581da49                   catalog: strict Rust model over the game JSON export; site no longer reads .fb (catalog thread)
6cf2c6b f67bbb0 d9b42dc           data: game export 7.0.0 (1139 items EN+RU); structure map (catalog thread)
e166c0a cbdfc3f                   branches: placeholder image URL; content-hashed /pkg, immutable cache (catalog thread)
0ae4c7c 366ea04 2d51f58           plan: drop phases G and H; LEGACY notes; merge
```

Verification at head: `check_docs` 0 errors / 79 warnings, CI green.

### 7.3 Known issues found in the 2026-10-01 analysis (not yet fixed unless noted)

Security:
- DOM XSS in `Frontend/Web/ground/branches/items/_items/managers/runtime/rich-query-renderer.ts`; reflected XSS in `Frontend/Web/functions/utils/seo-utils.ts`; no Content-Security-Policy.
- Player PII committed in `Backend/PlayerData/Profiles` and `tests/fixtures/profiles`.
- main: backend port 8000 exposed; open proxy behaviour.
- Rustified: `BACKEND_BIND=0.0.0.0`; rate limit bypassable via `X-Forwarded-For`.

main bugs: `api.py:187` wipes items; `DetachedInstanceError` (HTTP 400) after resync; missing `init_db.sql`.

Rustified blockers: Postgres migration conflicts with the existing DB; SQLite URL lacks `mode=rwc`; seeding only on empty table → FK error 500; some 404 routes; 17 missing images; panic at `level.rs:32` in `RBackend/crates/core/src/profile/` (two `level.rs` files exist: `profile/level.rs` and `profile/heroes/level.rs`; check which); FlatBuffers packs bigger than JSON; validators check the wrong file.

Shared: `scripts/git_push.py` breaks history (never use it on the orphan branch); `update.ps1` and `run_docker.py` are destructive; 100 MB images without LFS; RU items JSON has `"language": "en"`; 67 embargoed items are served; docs 1:1 law was violated (fixed on `rust-leptos`).

## 8. Technical knowledge you will need (gotchas)

1. **Always build with `--split`.** `cargo leptos build --release --split` produces `split_<island>_loader_<hash>.wasm`, `__wasm_split_manifest.json`, `__wasm_split.*.js`. Without it the main JS keeps `__wasm_split_placeholder__` and every island breaks. The server now refuses to start on an unsplit build and prints the rebuild command.
2. **Use binaries built by cargo-leptos**, not plain `cargo build` (that one expects `_bg` WASM names).
3. **Islands router head rule:** it diffs old and new documents node by node; any extra or missing `<head>` tag on one page wipes `<body>` on navigation. Therefore the Shell draws the same head shape on every page: title, description, robots (from `BranchSpec::sitemap`), and links for **all** lazy chunks — `preload` with `media="all"` when the page uses the island, `media="not all"` when not. `prefetch_lazy_islands` then fetches unused chunks on idle (`requestIdleCallback`, 1 s `setTimeout` fallback). Don't use `leptos_meta` in branches.
4. **Hashed file names:** `SplitFiles` reads cargo-leptos' hash file next to the binary (keys `js`, `manifest`, `split`), same as `HydrationScripts`.
5. **Measured benefit of lazy islands** (Slow 4G, 4× CPU, mobile, median of 5): home interactive 1.78 s vs 2.08 s eager; catalog 2.36 vs 2.41 s; home→catalog nav 460 vs 435 ms (chunk from cache). Main WASM 227 KB (100 KB gzip) vs 340 KB (146 KB gzip); items chunk 137 KB (60 KB gzip).
6. **Leptos vs old site** (2026-10-02, local, brotli), time to visible item cards: desktop 0.09–0.18 s vs ~0.9–1.2 s; throttled phone 0.4 s vs 4.4–6.5 s (main) and 5–9.8 s (Rustified); Lighthouse mobile 92–95 vs 41–59. The server sends 48 cards as ~4 KB HTML. The gain is mostly on phones.
7. **Docs linter:** run `python3 scripts/check_docs.py` and `python3 scripts/generate_structure.py` before every push; new source file ⇒ new mirror `.md` in `docs/<same path>.md`.
8. **Deploy safety:** only `main` deploys to the VPS. Feature branches only produce Pages previews.

## 9. Idea on record: one project config (NixOS-like)

Proposed, not started: a typed `project.toml` (read via serde) as the single source for ports, routes, feature flags, build options; a generator (`cargo xtask gen`) writes derived files (compose, Pages env docs, etc.) and CI fails if they are stale; a JSON Schema gives editor autocomplete; secrets never go in the file; Nix can be added later as an optional layer.

## 10. Where things live

| What | Where |
|---|---|
| Code | GitHub repo, branch `rust-leptos` (PR #4) |
| Old analysis reports (Russian) | project files `/mnt/project-files/reports/branches-2026-10-01/` (`00-итог.md` summary, `01`–`04` details, `05` Rustified architecture, `06` product & UI, `screens/`) |
| Migration plan (Russian) | `rust_migration_plan.md` on `Rustified` / `rust-leptos` |
| Repo rules | `REQUIREMENTS.md` (replaced ARENA.MD 2026-10-07) |
| Project memory | shared Claude project memory (team/silo) |
| This file | `SUMMARY.md` at the repo root on `rust-leptos` (PR #4); copy at `/mnt/project-files/reports/branches-2026-10-01/SUMMARY.md` |
| Game data | `Backend/DB/items_{en,ru}_7_0_0.json` (also 5.1.0 for tests); ContentKit zips in `/mnt/project-files/` |

## 11. Questions still open for Иван

1. When to do the Dockerfile/compose work for `branches` (needed before any switch).
2. ~~Static JSON catalog vs FlatBuffers packs~~ decided 2026-10-06 (§3).
3. What the Editor page should do.
6. What exactly is wrong with the filter/sort UX in the old site.
4. Gaps in the Item Field spec (exact sizes of small/medium/detailed forms, behaviour at grid edges, mobile gestures, what "star-shaped grid" shows).
5. Whether to review and fix the 17 SonarQube issues and the XSS findings now or after the Item Field.

## 12. Findings of the 2026-10-01/02 analysis (reports 00–06, condensed)

Reports (Russian): `00-итог.md` summary · `01` history, docs, data, secrets · `02` Python backend (main) · `03` Rust backend (Rustified) · `04` frontend of both branches · `05` Rustified architecture · `06` site through a user's eyes and product goal · `screens/` (14 screenshots).

- **Branches (01):** `main` 219 commits, Python FastAPI + SQLModel + Alembic, Vite/TS frontend. `Rustified` is an orphan branch whose first commit `7cda9d8` snapshots `main@3eec7d2`; commits by the "Arena" agent (`patch <patch@local>`). Python backend files are already gone on Rustified.
- **Python backend (02):** pytest 92 passed (72% coverage). Bugs: `api.py:187` wipes items; `DetachedInstanceError` (400) after resync; missing `init_db.sql`; port 8000 exposed; open proxy.
- **Rust backend (03):** 105 cargo tests (7 skip without packs). Blockers listed in §7.3. Plan was ~35–40% done then.
- **Frontend (04):** vitest 36/36 (main), 30/31 (Rustified). DOM XSS in `rich-query-renderer.ts`, reflected XSS in `functions/utils/seo-utils.ts`, no CSP. Rustified switched the frontend to FlatBuffers decoders.
- **Architecture (05):** the TS frontend is a home-made micro-framework: `Gen` (History-API router singleton), `Branch` (HTML string → `innerHTML` → `init()`), `StructuredBranch` (Display/Data/State/Logic roles), `BranchSpec` + `BranchRunner` (declarative page → generated class); item detail was an overlay mounted by `ItemsManager`. Backend: 7 crates (core, pack, middleware = FB decoders not HTTP, db, api, builder, cli). Weak spots called out: HTML strings without default escaping; router unaware of query/nested routes; FlatBuffers used as "binary JSON" (now moot: catalog is JSON again); two copies of the item reference data; API tied to repo layout; naming confusion ("Branch", "middleware"); splitting files only to meet line limits. The report doubted phase I (Leptos) — Иван chose it anyway (§3), and the measured speed-up on phones (§8.6) justified it.
- **Product and UI (06):** good: consistent game-like style, fast catalog, shareable profile card, Lighthouse a11y/best-practices/SEO = 100. Rustified's WIP item card added the shape grid with stars and recipes, but catalog images at real shape scale looked worse than main. The promised analytics do not exist; suggested next steps are in §2.
- **Shared risks (00):** player PII in the repo; `git_push.py` breaks history; destructive `update.ps1` / `run_docker.py`; 100 MB images without LFS; RU JSON with `"language": "en"`; embargoed items served.

## 13. What this thread did (2026-10-01 → 2026-10-06)

1. Analysed both branches and wrote reports 00–06 (code, builds, tests, security, history, architecture, product, UI, Lighthouse).
2. Rewrote all mirror docs from the sources, rebuilt `check_docs.py` as the `docs_lint` package and added the docs CI.
3. Built the Leptos site (`branches` crate) with the dendritic roots, ported the old look, RU/EN, Editor placeholder, Pages proxy behind `LEPTOS_SSR`.
4. Fixed the islands-router head problem, made `ItemsManager` a lazy island (`--split`), handled hashed file names; measured the gains.
5. Consolidated PRs #1–#3 into one branch `rust-leptos` / PR #4.
6. Published static artifacts of the site (buttons do not work there) and answered questions: NixOS-like config idea (§9), deploy safety, Codex/SonarQube reviews.
7. Wrote the handoff (`LEGACY.md`, now this file), removed phases G/H from the plan, estimated progress.

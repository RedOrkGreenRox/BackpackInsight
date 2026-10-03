# [branches/branches/main/mod.rs](/RBackend/crates/branches/src/branches/main/mod.rs)

## Назначение
`MainBranch` — главная страница `/`: витрина профиля с зоной загрузки экспорта игры. Разметка, `id` и классы те же, что у TS-версии ([MainBranch.ts](/docs/Frontend/ground/branches/main/MainBranch.md)), поэтому работают перенесённые стили. Чисто серверная (`ssr`), без островов: форма пока только показывается, загрузка профиля переносится вместе со страницей профиля.

## Ключевая функциональность
- **`struct MainBranch`** + `impl Branch`:
  - `SPEC`: `name` `MainBranch`, `path` `/`, `islands` пустой, `sitemap: true`;
  - `head(ctx)`: `PageHead::site` — заголовок «Backpack Insight», описание из ключа `main_meta_description` ([roots/head.rs](../../roots/head.md));
  - `render(ctx)`:
    - `.container`:
      - `#errorContainer.error` — скрытый блок ошибок (`role="alert"`, `aria-live="polite"`) для будущего острова загрузки;
      - `h1.main-title` с ключом `profile_title` («Витрина профилей»);
      - `form.upload-zone#uploadForm` → `.upload-area#uploadArea`: скрытый `input#fileInput` (`.json`), `textarea#jsonInput` для вставки экспорта (подпись `profile_upload_textarea_label`) и подсказка `.upload-hint#uploadHint` из трёх строк `profile_upload_hint_1..3` (вторая с `.pc-only`, на телефоне скрыта);
      - `button.button-view-profile#submitBtn` с подписью `profile_view_button`.

Маршрут `/` принадлежит этой ветке: поэтому `BranchRunner` подключает `api::routes`, а не `api::app` с текстовым баннером на `/` ([api/lib.rs](../../../../api/src/lib.md)).

## Стили
Перенесённые без изменений [main.scss](../../../style/branches/main/main.md); [site.scss](../../../style/site.md) включает их только внутри `main[data-branch="MainBranch"]`, чтобы `.container` главной не менял ширину других страниц.

## Связи
- Регистрация: [roots/gen.rs](../../roots/gen.md). Список веток: [branches/mod.rs](../mod.md).

## Планируется
- Остров `MainManager`: чтение файла или вставленного JSON, отправка в `/api` и переход на страницу профиля, как в TS-версии. См. «Планируется» в [обзоре крейта](../../../../branches.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-03.

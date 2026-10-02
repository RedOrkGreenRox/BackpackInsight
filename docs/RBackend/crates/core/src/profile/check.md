# [core/profile/check.rs](/RBackend/crates/core/src/profile/check.rs)

## Назначение
Базовая проверка формы загруженного профиля до разбора деталей. Ядро не читает JSON само — вызывающий заполняет плоский `ProfileCheckInput`.

## Типы
- `ProfileCheckInput` — `has_data` (есть секция Data), `outer_uid` и `data_uid` (UID в корне и внутри Data), `name`, `has_hero`, `has_item`.
  - `uid()` — UID из Data, иначе из корня; пустые и пробельные строки игнорируются.
  - `clean_name()` — имя, если оно не пустое.
- `ProfileIssue` — одна проблема: `MissingData`, `MissingUid`, `MissingName`, `MissingHeroAndItem`; `Display` даёт английское описание (например, `missing UID in root or Data`).
- `ProfileCheckReport` — список `issues`; `is_valid()` — список пуст.

## API
- `ProfileCheckService::check(input)` — собирает все проблемы по порядку: нет Data; нет UID; нет имени; нет ни героев, ни предметов (достаточно одной из секций).

## Связи
- Вызывается в [api/profile/view](../../../api/src/profile/view.md) перед сборкой ответа; ошибки превращаются в ответ API с кодом ошибки. Обзор: [core_profile_check](../../../core_profile_check.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

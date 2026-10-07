# [Регрессионный тест профилей (regression_tests.rs)](/RBackend/crates/api/src/profile/regression_tests.rs)

## Назначение
Регрессионный тест на реальных профилях: модуль подключается только под `cfg(test)`. Повторяет Python-тест `test_profiles_integration.py` из старого бэкенда.

## Тест `ingests_all_real_profiles_without_errors`
- Пропускается с сообщением, если нет `RBackend/generated/api_items_en.fb` или каталога `tests/fixtures/profiles`.
- Требует ровно 13 файлов `*.json` в каталоге фикстур; BOM в начале файла отрезается.
- Для каждого профиля `profile_view` ([view](view.md)) должен пройти без ошибки, распознать хотя бы одного героя или предмет, дать непустой ник и арену и уровень не ниже 1.
- Нераспознанные герои и предметы не роняют тест, а выводятся предупреждениями и итоговыми счётчиками.

## Помощники
- `KNOWN_RAW_HERO_NAMES` и `is_known_hero` — герой считается известным, если его имя совпадает с сырым именем из списка или с результатом `HeroNameService::normalize` ([core/heroes/name](../../../core/src/profile/heroes/name.md)).
- `repo_root`, `profiles_dir`, `packs_missing`, `load_profile`, `raw_item_count`, `raw_hero_count` — пути, загрузка JSON и подсчёт сырых записей.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

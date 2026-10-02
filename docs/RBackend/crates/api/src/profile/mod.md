# [api/profile/mod.rs](/RBackend/crates/api/src/profile/mod.rs)

## Назначение
Разбор игрового JSON-профиля в представление для `POST /api/profile.fb` ([routes/profile_binary](../routes/profile_binary.md)). Бизнес-правила (уровни, лиги, редкости, скины) живут в crate core; здесь — только чтение JSON и сборка ответа.

| Подмодуль | Роль | Документ |
| :--- | :--- | :--- |
| `json_input` | достаёт из JSON входы сервисов core | [json_input](json_input.md) |
| `heroes` | герои из поля `Hero` | [heroes](heroes.md) |
| `items` | предметы из поля `Item` через каталог | [items](items.md) |
| `catalog_cache` | кеш каталога предметов по языкам | [catalog_cache](catalog_cache.md) |
| `view` | сборка всего ответа `profile_view` | [view](view.md) |
| `regression_tests` | прогон реальных профилей, только в тестах | [regression_tests](regression_tests.md) |

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

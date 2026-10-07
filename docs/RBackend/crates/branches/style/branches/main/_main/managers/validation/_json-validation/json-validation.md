# [Мини-редактор JSON (json-validation.scss)](/RBackend/crates/branches/style/branches/main/_main/managers/validation/_json-validation/json-validation.scss)

## Назначение
Стилизация "мини-редактора" кода, который появляется при обнаружении синтаксических ошибок в вставленном JSON-логе.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/main/_main/managers/validation/_json-validation/json-validation.scss](/docs/Frontend/ground/branches/main/_main/managers/validation/_json-validation/json-validation.md).
**Сейчас не подключён ни одним `@use`**, поэтому в CSS сайта не попадает. В TS-версии тоже: классы рисует `JsonValidator.ts`, но этот файл стилей никто не импортирует. Понадобится острову загрузки профиля на главной; тогда его нужно добавить в [main.scss](../../../../main.md).

## Содержимое
- Классы и id: `.json-validation-error`, `.validation-error-header`, `.error-dismiss-btn`, `.error-line-numbers`, `.line-number`, `.json-code`, `.code-line`, `.error-char`, `.validation-error-footer`, `.low-res-mode`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02

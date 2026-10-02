# [core/profile/heroes/name.rs](/RBackend/crates/core/src/profile/heroes/name.rs)

## Назначение
`HeroNameService` переводит внутренние (старые) идентификаторы героев из профиля в имена, которые использует приложение (картинки, подписи).

## `normalize(raw_name)`
| В профиле | Имя в приложении |
| :--- | :--- |
| `Barbarian` | `Harkon` |
| `Elementalist` | `Chana` |
| `Warrior` | `Ronan` |
| `Marksman` | `Nymphedora` |
| `Engineer` | `Tink` |
| `Beekeeper` | `Buzz` |

`Hob` и любые неизвестные имена возвращаются без изменений.

## Связи
- Используется в [heroes/mod](mod.md); регрессионные тесты API — [regression_tests](../../../../api/src/profile/regression_tests.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

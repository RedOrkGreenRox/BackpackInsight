# [Правила профиля (mod.rs)](/Backend/crates/core/src/profile/mod.rs)

## Назначение
Корень доменных правил профиля игрока. Ядро не зависит от JSON: каждое правило принимает маленькую входную структуру, которую вызывающий собирает из JSON, FlatBuffers или тестовых данных. Модуль разбит по ответственности, всё нужное реэкспортируется наружу через [lib.rs](../lib.md).

## Подмодули
| Модуль | Видимость | Ответственность | Документ |
| :--- | :--- | :--- | :--- |
| `area` | приватный | трофеи → игровая область | [area](area.md) |
| `check` | приватный | базовая проверка формы профиля | [check](check.md) |
| `heroes` | `pub` | герои: имя, уровень, лига, рейтинг | [heroes/mod](heroes/mod.md) |
| `identity` | `pub` | UID и имя профиля | [identity/mod](identity/mod.md) |
| `items` | `pub` | предметы: редкость, карты, уровень по опыту | [items/mod](items/mod.md) |
| `level` | приватный | уровень игрока по суммарному опыту | [level](level.md) |
| `score` | приватный | трофеи, бонусные трофеи, область | [score](score.md) |
| `types` | приватный | общие value-типы | [types](types.md) |
| `unlocks` | `pub` | баннеры и скины | [unlocks/mod](unlocks/mod.md) |
| `wallet` | `pub` | монеты и гемы | [wallet/mod](wallet/mod.md) |

## Связи
- Основной потребитель — сборка ответа профиля в API: [api/profile/view](../../../api/src/profile/view.md); также [cli](../../../cli/src/main.md).
- Тематические обзоры: [core_profile_check](../../../core_profile_check.md), [core_profile_identity](../../../core_profile_identity.md), [core_profile_score](../../../core_profile_score.md), [core_profile_wallet](../../../core_profile_wallet.md), [core_items](../../../core_items.md), [core_unlocks](../../../core_unlocks.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

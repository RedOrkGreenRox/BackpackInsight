# [core/profile/items/cards.rs](/RBackend/crates/core/src/profile/items/cards.rs)

## Назначение
`CardsService` — сколько карт нужно предмету для следующего уровня и можно ли его улучшить.

## Таблицы карт по редкости
`COMMON_CARDS`, `RARE_CARDS`, `EPIC_CARDS`, `LEGENDARY_CARDS`, `MYTHIC_CARDS` — по 15 значений; `UNIQUE_CARDS` совпадает с мифической; `RELIC_CARDS` — 10 значений (до 2000). Выбор таблицы — `cards_table(rarity)`; у `Boon` и `Special` таблицы нет.

## API
- `cards_need(rarity, level)` — значение таблицы с индексом `level − 1`. Возвращает `None`, если:
  - уровень 15 и выше (для `Relic` — 10 и выше), то есть предмет максимальный;
  - редкость `Boon` или `Special` (картами не улучшаются).
  В ответе API `None` превращается в `-1` ([api/profile/items](../../../../api/src/profile/items.md)).
- `is_upgradable(cards, cards_need)` — `true`, только если потребность известна и карт не меньше.

Пример: Common уровня 10 → 400 карт.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

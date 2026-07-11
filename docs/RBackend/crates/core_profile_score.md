# core profile score — trophies и area без лишнего дробления

`profile/score.rs` — пример более сбалансированной гранулярности.

Не каждое поле обязано иметь отдельный файл. Деление идёт по ответственности, а не механически по каждому значению.

`score.rs` держит вместе связанный маленький узел:

```text
Trophy
BonusTrophy
ProfileScoreInput
ProfileScore
ProfileScoreService
```

Потому что эти значения почти всегда используются вместе:

```text
trophy + bonus_trophy -> total_trophies -> area
```

CLI-команда:

```bash
cargo run -p cli -- profile-score --file ../tests/fixtures/synthetic_profile_full.json
```

---
> 📌 **Подпись документации:** profile score контрольная точка и правило сбалансированной гранулярности, 2026-07-06.

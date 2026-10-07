# [Оценка релевантности предмета (search-score.ts)](/Frontend/Web/ground/branches/items/_items/managers/filter/search-score.ts)

## Назначение
Хранение оценки релевантности прямо в объекте предмета под скрытым ключом `__itemsFuseScore` (`SCORE_KEY`). Свойство неперечисляемое, поэтому не попадает в `JSON.stringify` и обход ключей.

## Экспорт
- `setSearchScore(item, score)` — записывает оценку ([fuse-collector](fuse-collector.md)).
- `getSearchScore(item)` — оценка или `null` ([sort-service](sort-service.md)).
- `clearSearchScores(items)` — удаляет оценки перед новым поиском ([fuse-search](fuse-search.md)).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

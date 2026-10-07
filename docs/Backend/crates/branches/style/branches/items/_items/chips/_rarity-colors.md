# [Цвета редкостей у чипов (_rarity-colors.scss)](/Backend/crates/branches/style/branches/items/_items/chips/_rarity-colors.scss)

## Назначение
Специализированная надстройка над фильтр-чипсами, которая окрашивает их названия в соответствии с игровой редкостью предмета.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/items/_items/chips/_rarity-colors.scss](/docs/Frontend/ground/branches/items/_items/chips/_rarity-colors.md).
В [site.scss](../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="ItemsBranch"]` и `main[data-branch="EditorBranch"]`, поэтому действует только на этих страницах.

## Содержимое
- Классы и id: `#filterRarities`, `.filter-chip`, `.rarity-common`, `.rarity-rare`, `.rarity-epic`, `.rarity-legendary`, `.rarity-mythic`, `.rarity-unique`, `.rarity-relic`, `.rarity-boon`, `.rarity-special`, `.active`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02

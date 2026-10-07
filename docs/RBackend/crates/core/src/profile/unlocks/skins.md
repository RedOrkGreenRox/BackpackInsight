# [Разбор скинов (skins.rs)](/RBackend/crates/core/src/profile/unlocks/skins.rs)

## Назначение
`SkinService` разбирает строку разблокировки скина вида `{владелец}Skin{код}`.

## `parse(unlock)`
Ищет первое вхождение маркера `Skin` (`SKIN_MARKER`): часть до него — владелец, после — код скина. Обе части должны быть корректными `UnlockName` ([types](types.md)), иначе `None`.

Примеры: `NymphedoraSkin02` → владелец `Nymphedora`, скин `02`; `WarriorSkinGold` → `Warrior` / `Gold`; `Skin02`, `WarriorSkin`, `Warrior-Skin02` — не разбираются.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

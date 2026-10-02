# [comparison.ts](/Frontend/Web/ground/branches/items/_items/managers/filter/comparison.ts)

## Назначение
`parseAndEvaluateComparison(item, term)` — проверка числового условия по характеристике предмета. Поддерживает формы `10<damage<20`, `damage>=5` и `5<cooldown`; операторы `<`, `<=`, `>`, `>=`, `=`. Внешние круглые скобки снимаются. Если формула не распознана, условие истинно, когда у предмета есть такая характеристика.

## Внутреннее
- `getStatValue(item, name)` — значение по имени без учёта регистра; неизвестное имя или отсутствующее значение — `null`, и условие ложно.

| Имена | Поле |
| :--- | :--- |
| `criticalchance`, `critchance`, `critical_chance` | шанс крита |
| `criticaldamage`, `critdamage`, `critical_damage` | урон крита |
| `accuracy`, `acc` | точность |
| `staminacost`, `stamina` | расход выносливости |
| `cooldown`, `cd` | перезарядка |
| `damagemin`, `mindamage`, `damage_min` / `damagemax`, `maxdamage`, `damage_max` | урон |
| `coinvalue`, `value`, `price`, `gold`, `cost` | цена в монетах |
| `level`, `lvl` | уровень |

Боевые характеристики читаются из `item.combatStats`, цена и уровень — с самого предмета.
- `evaluateOp(left, op, right)` — применяет оператор.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02

export function parseAndEvaluateComparison(item: any, term: string): boolean {
    let cleaned = term.trim();
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) cleaned = cleaned.slice(1, -1).trim();

    const doubleRegex = /^(\d+(?:\.\d+)?)\s*([<>]=?|=)\s*([a-zA-Z_]+)\s*([<>]=?|=)\s*(\d+(?:\.\d+)?)$/i;
    let match = doubleRegex.exec(cleaned);
    if (match) {
        const val1 = Number.parseFloat(match[1]!);
        const op1 = match[2]!;
        const statName = match[3]!;
        const op2 = match[4]!;
        const val2 = Number.parseFloat(match[5]!);
        const statVal = getStatValue(item, statName);
        return statVal !== null && evaluateOp(val1, op1, statVal) && evaluateOp(statVal, op2, val2);
    }

    const singleLeftRegex = /^([a-zA-Z_]+)\s*([<>]=?|=)\s*(\d+(?:\.\d+)?)$/i;
    match = singleLeftRegex.exec(cleaned);
    if (match) {
        const statVal = getStatValue(item, match[1]!);
        return statVal !== null && evaluateOp(statVal, match[2]!, Number.parseFloat(match[3]!));
    }

    const singleRightRegex = /^(\d+(?:\.\d+)?)\s*([<>]=?|=)\s*([a-zA-Z_]+)$/i;
    match = singleRightRegex.exec(cleaned);
    if (match) {
        const statVal = getStatValue(item, match[3]!);
        return statVal !== null && evaluateOp(Number.parseFloat(match[1]!), match[2]!, statVal);
    }

    return getStatValue(item, cleaned) !== null;
}

function getStatValue(item: any, statName: string): number | null {
    const norm = statName.toLowerCase();
    const stats = item.combatStats || {};
    const aliases: Record<string, number | null> = {
        criticalchance: stats.criticalChance ?? null,
        critchance: stats.criticalChance ?? null,
        critical_chance: stats.criticalChance ?? null,
        criticaldamage: stats.criticalDamage ?? null,
        critdamage: stats.criticalDamage ?? null,
        critical_damage: stats.criticalDamage ?? null,
        accuracy: stats.accuracy ?? null,
        acc: stats.accuracy ?? null,
        staminacost: stats.staminaCost ?? null,
        stamina: stats.staminaCost ?? null,
        cooldown: stats.cooldown ?? null,
        cd: stats.cooldown ?? null,
        damagemin: stats.damageMin ?? null,
        mindamage: stats.damageMin ?? null,
        damage_min: stats.damageMin ?? null,
        damagemax: stats.damageMax ?? null,
        maxdamage: stats.damageMax ?? null,
        damage_max: stats.damageMax ?? null,
        coinvalue: item.coinValue ?? null,
        value: item.coinValue ?? null,
        price: item.coinValue ?? null,
        gold: item.coinValue ?? null,
        cost: item.coinValue ?? null,
        level: item.level ?? null,
        lvl: item.level ?? null,
    };
    return aliases[norm] ?? null;
}

function evaluateOp(left: number, op: string, right: number): boolean {
    if (op === '<=') return left <= right;
    if (op === '>=') return left >= right;
    if (op === '<') return left < right;
    if (op === '>') return left > right;
    if (op === '=' || op === '==') return left === right;
    return false;
}

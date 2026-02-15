/**
 * @file icon-parser.ts
 * @description Финальный рефакторинг: все списки и пути вынесены в начало для удобного редактирования.
 */

// --- КОНФИГУРАЦИЯ ---

/** Базовый путь к иконкам */
const IMAGE_BASE_PATH = '/images/FontIcon';

/** Список доступных файлов иконок (без расширения) */
const ICON_FILES = [
    "Day", "Hob", "Pet", "Buff", "Burn", "Buzz", "Coin", "Dawn", "Dorf", "Dusk", "Gold", "Life",
    "Luck", "Mana", "Miss", "Sage", "Soul", "Star", "Stun", "Tink", "Armor", "Bleed", "Blind", "Chana", "Chill",
    "Curse", "Enoch", "Haste", "Night", "Ronan", "Damage", "Debuff", "Harkon", "Health", "Morrow",
    "Pepper", "Poison", "Potion", "Resist", "Shared", "Static", "Thorns", "Celeste", "Empower", "Fatigue",
    "Stamina", "TypeBag", "TypeRat", "Accuracy", "Cooldown", "Insanity", "Resisted", "TypeFish", "TypeFood",
    "TypeTool", "Lifesteal", "MaxHealth", "Snowballs", "Stopwatch", "TypeArmor", "TypeCharm", "TypePlant",
    "TypeSkull", "CritChance", "CritDamage", "Nymphedora", "TypePotion", "MeleeWeapon", "TypeMineral",
    "RangedWeapon", "Regeneration", "StaminaUsage", "TypeAccessory", "TypeIngredient", "StaminaRecovery"
];

/** Маппинг текстовых названий на названия файлов иконок */
const ALIAS_MAP: { [key: string]: string } = {
    'Melee Weapon': 'MeleeWeapon', 'Ranged Weapon': 'RangedWeapon', 'Stamina Usage': 'StaminaUsage',
    'Stamina Recovery': 'StaminaRecovery', 'Crit Chance': 'CritChance', 'Crit Damage': 'CritDamage',
    'Max Health': 'MaxHealth', 'Accessory': 'TypeAccessory', 'Ingredient': 'TypeIngredient',
    'Mineral': 'TypeMineral', 'Potion': 'TypePotion', 'Food': 'TypeFood', 'Fish': 'TypeFish',
    'Plant': 'TypePlant', 'Skull': 'TypeSkull', 'Charm': 'TypeCharm', 'Bag': 'TypeBag',
    'Tool': 'TypeTool', 'Coin': 'Gold', 'Hob Gang': 'Hob',
    'stat_damageMin': 'Damage', 'stat_damageMax': 'Damage', 'stat_staminaCost': 'StaminaUsage',
    'stat_cooldown': 'Cooldown', 'stat_accuracy': 'Accuracy', 'stat_criticalChance': 'CritChance',
    'stat_criticalDamage': 'CritDamage', 'stat_critical': 'CritDamage', 'stat_stamina': 'Stamina'
};

/** Исключения для триггеров иконок (чтобы не заменяли часть названия предмета) */
const ICON_TRIGGER_EXCEPTIONS = ['Bag of Flour', 'Pet Rock'];

/** Слова, блокирующие превращение строки в заголовок, если стоят ПЕРЕД двоеточием */
const HEADER_EXCEPTIONS_BEFORE_COLON = ['to', 'more', 'less', 'higher', 'lower', 'inside']; // Добавлено 'inside'

/** Глаголы, блокирующие превращение строки в заголовок, если в ней НЕТ двоеточия */
const HEADER_EXCEPTIONS_NO_COLON = ['are', 'is', 'can', 'require', 'also', 'rerolls', 'gain', 'inflict', 'steal', 'benefits', 'counts'];

/** Глаголы и служебные слова, которые НЕ должны окрашиваться как названия предметов */
const FORBIDDEN_NAMES = [
    'Gain', 'Get', 'Give', 'Turn', 'Shoot', 'When', 'After', 'Every', 'Activate', 'Use', 'Steal',
    'Have', 'Inflict', 'Remove', 'Trap', 'Cleanse', 'Become', 'Per', 'On', 'Increased', 'If',
    'Reduce', 'Heal', 'Look', 'Spend', 'Deal', 'Next', 'Also', 'Increase', 'Transform', 'Your',
    'That', 'The', 'Add', 'Transfer', 'Attract', 'Trigger', 'Both', 'Restore', 'Brings',
    'Opponent', 'Crack', 'Find', 'Catch', 'No', 'Absorb', 'Block', 'Hits', 'Hammer', 'Break',
    'Drain', 'Suffer', 'Void', 'Sabotage'
];

/** Уникальные фразы для окрашивания целиком */
const KEYWORDS_REGEX = /\b(Discharge|common|magnetic|Sabotage|Lumps\s+of\s+Coal|Hunter['’]s\s+mark|Call\s+of\s+the\s+Void)\b/gi;

/** Приставки перед словом "item/items", которые могут быть окрашены вместе с ним */
const ITEM_PREFIX_KEYWORDS = ['magnetic', 'common'];

/** Триггеры для окрашивания чисел (слова, идущие ПОСЛЕ числа) */
const NUMBER_FOLLOW_TRIGGERS = `(%|seconds?|quantity|uses?|less|simple|common|magnetic|random|free|or|items?|more|by|max|min|enemy|\\[\\[ICN|[A-Z]|\\)|$)`;

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

const ALL_TRIGGER_WORDS = [...new Set([...ICON_FILES, ...Object.keys(ALIAS_MAP)])].sort((a, b) => b.length - a.length);

function createIconHtml(iconName: string, title: string): string {
    return ` <picture class="text-icon" title="${title}"><source srcset="${IMAGE_BASE_PATH}/avif/${iconName}.avif" type="image/avif"><source srcset="${IMAGE_BASE_PATH}/webp/${iconName}.webp" type="image/webp"><img src="${IMAGE_BASE_PATH}/webp/${iconName}.webp" alt="${title}" loading="lazy"></picture> `;
}

function getAlphaId(num: number): string {
    let id = '', n = num;
    while (n >= 0) { id = String.fromCharCode(65 + (n % 26)) + id; n = Math.floor(n / 26) - 1; }
    return id;
}

const replaceOutsideSpans = (str: string, regex: RegExp, handler: (...args: string[]) => string) => {
    const ignoreRegex = /(<span[^>]*>.*?<\/span>|\[\[ICN[A-Z]+]])/g;
    const combined = new RegExp(`(${ignoreRegex.source})|${regex.source}`, 'g');
    return str.replace(combined, (match, ignoreGroup, ...rest) => {
        if (ignoreGroup) return match;
        const groups = rest.filter(v => typeof v === 'string' && v !== str);
        return handler(...groups);
    });
};

// --- ОСНОВНОЙ ПАРСЕР ---

export function parseTextWithIcons(text: string | undefined | null): string {
    if (!text) return '';

    let processedText = text.replace(/\\(([^)]+)\\)/g, (_, content: string) => content.replace(/[^a-zA-Zа-яА-Я]/g, ''));
    const iconsMap = new Map<string, string>();
    let iconCounter = 0;

    // ШАГ 1 & 2: Скрытие иконок в плейсхолдеры
    let i = 0, tempText = '';
    while (i < processedText.length) {
        const remaining = processedText.substring(i);
        let matchFound = false;

        for (const word of ALL_TRIGGER_WORDS) {
            if (remaining.startsWith(word)) {
                if (ICON_TRIGGER_EXCEPTIONS.some(ex => remaining.startsWith(ex))) continue;

                const nextChar = processedText[i + word.length];
                const isConcatenated = ALL_TRIGGER_WORDS.some(w => processedText.substring(i + word.length).startsWith(w));

                if (!nextChar || !/[a-zA-Z]/.test(nextChar) || isConcatenated) {
                    const iconName = ALIAS_MAP[word] || word;
                    if (ICON_FILES.includes(iconName)) {
                        const alphaId = getAlphaId(iconCounter++);
                        const placeholder = `[[ICN${alphaId}]]`;
                        iconsMap.set(placeholder, createIconHtml(iconName, word));
                        tempText += placeholder;
                    } else tempText += word;
                    i += word.length; matchFound = true; break;
                }
            }
        }
        if (!matchFound) tempText += processedText[i++];
    }
    processedText = tempText;

    // ШАГ 3: Заголовки
    const headerPattern = /(^|\n|\\n)(Quantity\s*:[^\n\\]*|[ \t]*• After[^:\n\\]+|(?![ \t]*[•+](?![^:\n\\]*:))(?!\s*•?\s*\d+%)(?!\s*If\b(?![^:\n\\]*:))[^:\n\\]+)(:|(?=\n)|$)/g;
    processedText = processedText.replace(headerPattern, (...args) => {
        const [start, content, end] = [args[1], args[2], args[args.length - 3] || ''];
        if (!content.trim()) return args[0];

        const trimmed = content.trim();
        const endEx = new RegExp(`\\b(${HEADER_EXCEPTIONS_BEFORE_COLON.join('|')})$`, 'i');
        const noColEx = new RegExp(`\\b(${HEADER_EXCEPTIONS_NO_COLON.join('|')})\\b`, 'i');

        if (end === ':' && endEx.test(trimmed)) return args[0];
        if (!end && noColEx.test(content)) return args[0];

        return `${start}<span class="value-text">${content}${end}</span>`;
    });

    // ШАГ 4 & 5: Проценты и числа
    processedText = replaceOutsideSpans(processedText, /(\(\s*[+-]\d+%.*?\))|([+-]?\d+%)/g, (m) => `<span class="value-text">${m}</span>`);
    const numRegex = new RegExp(`(?<!\\/)([+-]?[\\d.]+(?:-[\\d.]+)?|[\\d.]+)(\\s*)${NUMBER_FOLLOW_TRIGGERS}`, 'g');
    processedText = replaceOutsideSpans(processedText, numRegex, (n, s, f) => f === '%' ? `<span class="value-text">${n}%</span>${s}` : `<span class="value-text">${n}</span>${s}${f}`);

    // ШАГ 6: Названия и ключевые слова
    processedText = replaceOutsideSpans(processedText, /\b(by\s+)([\d.]+)\b/g, (b, n) => `${b}<span class="value-text">${n}</span>`);
    processedText = processedText.replace(/(^|\n|\\n)([A-Z][a-z]+\s+)([\d.]+(?:-[\d.]+)?)/g, (m, s, w, n) => n.includes('span') ? m : `${s}${w}<span class="value-text">${n}</span>`);

    const itemNamesRegex = /(?<!\()\b([A-Z][a-z]+(?:['’]s)?((\s+of)?\s+[A-Z][a-z]+(?:['’]s)?)*)\b/g;
    processedText = replaceOutsideSpans(processedText, itemNamesRegex, (m) => FORBIDDEN_NAMES.includes(m.split(/\s+/)[0].replace(/['’]s$/, "")) ? m : `<span class="value-text">${m}</span>`);

    // Star + Item/Items logic
    iconsMap.forEach((html, placeholder) => {
        if (html.includes('title="Star"')) {
            const starWordRegex = new RegExp(`(${placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[ \xA0\t]*)(items?|Items?|[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'g');
            processedText = replaceOutsideSpans(processedText, starWordRegex, (s, name) => `${s}<span class="value-text">${name}</span>`);
        }
    });

    processedText = replaceOutsideSpans(processedText, KEYWORDS_REGEX, (m) => `<span class="value-text">${m}</span>`);
    const itemPrefixes = ITEM_PREFIX_KEYWORDS.join('|');
    const itemSuffixRegex = new RegExp(`(<span class="value-text">[\\d.-]+<\\/span>\\s*(?:(?:${itemPrefixes})\\s+|<span[^>]*>.*?<\\/span>\\s*)?|per\\s+)(items?)\\b`, 'gi');
    processedText = processedText.replace(itemSuffixRegex, (_, p, i) => `${p}<span class="value-text">${i}</span>`);
    processedText = replaceOutsideSpans(processedText, /(^|\n|\\n)(This)\b/g, (s, w) => `${s}<span class="value-text">${w}</span>`);

    // ШАГ 7: Возврат иконок
    iconsMap.forEach((html, placeholder) => processedText = processedText.split(placeholder).join(html));
    processedText = processedText.replace(/(title="Star".*?<\/picture>\s*)(items?|Items?)\b/g, '$1<span class="value-text">$2</span>');

    return processedText.replace(/\\n/g, '<br>');
}

export function generateIconsOrText(words: string[] | undefined): string {
    if (!words || words.length === 0) return '';
    const TYPE_ALIASES: { [key: string]: string } = {'Armor': 'TypeArmor'};
    return words.map(word => {
        const t = word.trim();
        const icon = TYPE_ALIASES[t] || ALIAS_MAP[t] || t;
        return ICON_FILES.includes(icon) ? createIconHtml(icon, t) : `<span class="text-fallback">${t}</span>`;
    }).join(' ');
}
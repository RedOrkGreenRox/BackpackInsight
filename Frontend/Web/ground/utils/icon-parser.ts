/**
 * @file icon-parser.ts
 * @description Исправлено перекрытие заголовков и вложенность тегов для Dragonleaf.
 */

const DEFAULT_TEXT_CLASS = 'text-default';

const IMAGE_FORMATS = [
    {type: 'image/webp', ext: 'webp', path: '/images/fonticon/webp'},
    {type: 'image/avif', ext: 'avif', path: '/images/fontIcon/avif'},
];

const DEFAULT_IMAGE_FORMAT = IMAGE_FORMATS.find(f => f.ext === 'webp') || IMAGE_FORMATS[0];

const TYPE_GENERATOR_ALIASES: { [key: string]: string } = {
    'Armor': 'TypeArmor'
};

const SPECIAL_LOGIC_ICON = "Star";
const START_LINE_KEYWORDS = ['This'];
const ITEM_WORD_VARIANTS = 'items?|Items?';

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

const ICON_TRIGGER_EXCEPTIONS = ['Bag of Flour', 'Pet Rock'];
const HEADER_EXCEPTIONS_BEFORE_COLON = ['to', 'more', 'less', 'higher', 'lower', 'inside', 'slot', 'Стоимость', 'Cost', 'Hero', 'Герой'];
const HEADER_EXCEPTIONS_NO_COLON = ['are', 'is', 'can', 'require', 'also', 'rerolls', 'gain', 'inflict', 'steal', 'benefits', 'counts', 'per'];

const FORBIDDEN_NAMES = [
    'Gain', 'Get', 'Give', 'Turn', 'Shoot', 'When', 'After', 'Every', 'Activate', 'Use', 'Steal',
    'Have', 'Inflict', 'Remove', 'Trap', 'Cleanse', 'Become', 'Per', 'On', 'Increased', 'If',
    'Reduce', 'Heal', 'Look', 'Spend', 'Deal', 'Next', 'Also', 'Increase', 'Transform', 'Your',
    'That', 'The', 'Add', 'Transfer', 'Attract', 'Trigger', 'Both', 'Restore', 'Brings',
    'Opponent', 'Crack', 'Find', 'Catch', 'No', 'Absorb', 'Block', 'Hits', 'Hammer', 'Break',
    'Drain', 'Suffer', 'Void', 'Sabotage', "Weaken", "Turns"
];

const KEYWORDS_REGEX = /\b(Discharge|common|magnetic|Sabotage|empty|Lumps\s+of\s+Coal|Hunter['’]s\s+mark|Call\s+of\s+the\s+Void)\b/gi;
const ITEM_PREFIX_KEYWORDS = ['magnetic', 'common'];
const ITEM_SCALING_PREPOSITIONS = ['per', 'for each'];
const ITEM_SUFFIX_PREFIX_PATTERN = `(<span class="value-text">[\\d.-]+<\\/span>\\s*(?:(?:${ITEM_PREFIX_KEYWORDS.join('|')})\\s+|<span[^>]*>.*?<\\/span>\\s*)?|${ITEM_SCALING_PREPOSITIONS.join('|')}\\s+)`;

const FORCED_HEADER_KEYWORDS = ['Quantity', '• After'];
const HEADER_BLOCK_KEYWORDS = ['If'];
const NUMBER_FOLLOW_TRIGGERS = `(%|seconds?|quantity|uses?|less|simple|common|magnetic|random|free|or|${ITEM_WORD_VARIANTS}|more|by|max|min|enemy|\\[\\[ICN|[A-Z]|\\)|$)`;

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

const ALL_TRIGGER_WORDS = [...new Set([...ICON_FILES, ...Object.keys(ALIAS_MAP)])].sort((a, b) => b.length - a.length);

function createIconHtml(iconName: string, title: string): string {
    const sources = IMAGE_FORMATS.map(format =>
        `<source srcset="${format.path}/${iconName.toLowerCase()}.${format.ext}" type="${format.type}">`
    ).join('');

    return ` <picture class="text-icon" title="${title}">` +
        `${sources}` +
        `<img src="${DEFAULT_IMAGE_FORMAT.path}/${iconName.toLowerCase()}.${DEFAULT_IMAGE_FORMAT.ext}" alt="${title}" loading="lazy">` +
        `</picture> `;
}

function getAlphaId(num: number): string {
    let id = '', n = num;
    while (n >= 0) {
        id = String.fromCharCode(65 + (n % 26)) + id;
        n = Math.floor(n / 26) - 1;
    }
    return id;
}

const replaceOutsideSpans = (str: string, regex: RegExp, handler: (...args: string[]) => string) => {
    const ignoreRegex = /(<span[^>]*>.*?<\/span>|\[\[ICN[A-Z]+]]|<picture[^>]*>.*?<\/picture>|<br\s*\/?>)/g;
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

    // ШАГ 1 & 2: Скрытие иконок
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
                    i += word.length;
                    matchFound = true;
                    break;
                }
            }
        }
        if (!matchFound) tempText += processedText[i++];
    }
    processedText = tempText;

    // ШАГ 3: Заголовки (ИСПРАВЛЕНО: возвращена проверка исключений без двоеточия)
    const forcedPart = FORCED_HEADER_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const blockPart = HEADER_BLOCK_KEYWORDS.join('|');

    // Регулярное выражение теперь снова опционально ищет двоеточие в конце короткой фразы
    const headerPattern = new RegExp(
        `(^|\\n|\\\\n)((?:(?:${forcedPart})[^:\\n\\\\•]+|(?![ \\t]*[•+](?![^:\\n\\\\]*:))` +
        `(?![\\s•]*\\d+%)(?!(?:\\s*${blockPart}\\b)(?![^:\\n\\\\]*:))[^:\\n\\\\•]{1,60}))(:|(?=\\n)|$)`,
        'g'
    );

    processedText = processedText.replace(headerPattern, (...args) => {
        const [start, content, end] = [args[1], args[2], args[3] || ''];
        if (!content.trim()) return args[0];

        const trimmed = content.trim();
        const endEx = new RegExp(`\\b(${HEADER_EXCEPTIONS_BEFORE_COLON.join('|')})$`, 'i');
        const noColEx = new RegExp(`\\b(${HEADER_EXCEPTIONS_NO_COLON.join('|')})\\b`, 'i');

        // Проверка исключений (TS6133 теперь решена)
        if (end === ':' && endEx.test(trimmed)) return args[0];
        if (!end && noColEx.test(content)) return args[0]; // Вот здесь используется переменная

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

    // ШАГ 6.1: Специальная логика для Star (Placeholder Star + Name)
    iconsMap.forEach((html, placeholder) => {
        if (html.includes(`title="${SPECIAL_LOGIC_ICON}"`)) {
            const followWordRegex = new RegExp(`(${placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[ \\xA0\\t]*)(${ITEM_WORD_VARIANTS}|[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'g');
            processedText = processedText.replace(followWordRegex, (_match, s, name) => {
                return `${s}<span class="value-text">${name}</span>`;
            });
        }
    });

    processedText = replaceOutsideSpans(processedText, KEYWORDS_REGEX, (m) => `<span class="value-text">${m}</span>`);

    // ШАГ 6.2: Окрашивание слова item/items
    const itemSuffixRegex = new RegExp(`${ITEM_SUFFIX_PREFIX_PATTERN}(${ITEM_WORD_VARIANTS})\\b`, 'gi');
    processedText = processedText.replace(itemSuffixRegex, (_match, prefix, itemWord) => `${prefix}<span class="value-text">${itemWord}</span>`);

    const startKeywords = START_LINE_KEYWORDS.join('|');
    processedText = replaceOutsideSpans(processedText, new RegExp(`(^|\\n|\\\\n)(${startKeywords})\\b`, 'g'), (s, w) => `${s}<span class="value-text">${w}</span>`);

    // --- ФИНАЛЬНЫЕ ШАГИ ОБРАБОТКИ ТЕКСТА ---

    // 1. Возвращаем иконки
    iconsMap.forEach((html, placeholder) => {
        processedText = processedText.split(placeholder).join(html);
    });

    // 2. Переносы строк
    processedText = processedText.replace(/\\n/g, '<br>');

    // 3. ОБЕРТКА ОБЫЧНОГО ТЕКСТА
    // Исключаем буллиты и уже созданные теги
    const rawTextRegex = /([^<>\n\r•]+)(?![^<]*>)/g;
    processedText = replaceOutsideSpans(processedText, rawTextRegex, (match) => {
        const trimmed = match.trim();
        if (!trimmed) return match;

        const leadingSpace = match.match(/^\s*/)?.[0] || '';
        const trailingSpace = match.match(/\s*$/)?.[0] || '';

        return `${leadingSpace}<span class="${DEFAULT_TEXT_CLASS}">${trimmed}</span>${trailingSpace}`;
    });

    // 4. ФИКС ВЛОЖЕННОСТИ (РЕШАЕТ ПРОБЛЕМУ ЦВЕТА)
    // Если Шаг 6 или Шаг 3 создали вложенный спан, вычищаем его, оставляя приоритет за value-text
    processedText = processedText.replace(/<span class="value-text">([\s\S]*?)<span class="text-default">([\s\S]*?)<\/span>([\s\S]*?)<\/span>/g, '<span class="value-text">$1$2$3</span>');
    processedText = processedText.replace(/<span class="text-default">([\s\S]*?)<span class="value-text">([\s\S]*?)<\/span>([\s\S]*?)<\/span>/g, '<span class="text-default">$1</span><span class="value-text">$2</span><span class="text-default">$3</span>');

    // 5. Пост-клин для Dragonleaf после иконок Star
    const finalIconCleanup = new RegExp(`(title="${SPECIAL_LOGIC_ICON}".*?<\\/picture>\\s*)(${ITEM_WORD_VARIANTS}|[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)\\b`, 'g');
    processedText = processedText.replace(finalIconCleanup, (match, icon, name) => {
        if (name.includes('class="value-text"')) return match;
        // Если имя оказалось в text-default, вынимаем его
        const cleanName = name.replace(/<[^>]*>/g, "");
        return `${icon}<span class="value-text">${cleanName}</span>`;
    });

    return processedText;
}

export function generateIconsOrText(words: string[] | undefined): string {
    if (!words || words.length === 0) return '';
    return words.map(word => {
        const t = word.trim();
        const icon = TYPE_GENERATOR_ALIASES[t] || ALIAS_MAP[t] || t;
        return ICON_FILES.includes(icon) ? createIconHtml(icon, t) : `<span class="text-fallback">${t}</span>`;
    }).join(' ');
}
/**
 * @file icon-parser.ts
 * @description Финальная стабильная версия: исправлены заголовки Quantity/After,
 * разделение стата Armor и типа Armor, а также поддержка item/items во всех падежах.
 */

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
    'Melee Weapon': 'MeleeWeapon',
    'Ranged Weapon': 'RangedWeapon',
    'Stamina Usage': 'StaminaUsage',
    'Stamina Recovery': 'StaminaRecovery',
    'Crit Chance': 'CritChance',
    'Crit Damage': 'CritDamage',
    'Max Health': 'MaxHealth',
    'Accessory': 'TypeAccessory',
    'Ingredient': 'TypeIngredient',
    'Mineral': 'TypeMineral',
    'Potion': 'TypePotion',
    'Food': 'TypeFood',
    'Fish': 'TypeFish',
    'Plant': 'TypePlant',
    'Skull': 'TypeSkull',
    'Charm': 'TypeCharm',
    'Bag': 'TypeBag',
    'Tool': 'TypeTool',
    'Coin': 'Gold',
    'Hob Gang': 'Hob',
    'stat_damageMin': 'Damage',
    'stat_damageMax': 'Damage',
    'stat_staminaCost': 'StaminaUsage',
    'stat_cooldown': 'Cooldown',
    'stat_accuracy': 'Accuracy',
    'stat_criticalChance': 'CritChance',
    'stat_criticalDamage': 'CritDamage',
    'stat_critical': 'CritDamage',
    'stat_stamina': 'Stamina'
};

const ALL_TRIGGER_WORDS = [...new Set([...ICON_FILES, ...Object.keys(ALIAS_MAP)])].sort((a, b) => b.length - a.length);

function createIconHtml(iconName: string, title: string): string {
    return ` <picture class="text-icon" title="${title}"><source srcset="/images/FontIcon/avif/${iconName}.avif" type="image/avif"><source srcset="/images/FontIcon/webp/${iconName}.webp" type="image/webp"><img src="/images/FontIcon/webp/${iconName}.webp" alt="${title}" loading="lazy"></picture> `;
}

export function parseTextWithIcons(text: string | undefined | null): string {
    if (!text) return '';

    let processedText = text.replace(/\\(([^)]+)\\)/g, (_match, content: string) => {
        return content.replace(/[^a-zA-Zа-яА-Я]/g, '');
    });

    const iconsMap = new Map<string, string>();
    let iconCounter = 0;

    function getAlphaId(num: number): string {
        let id = '';
        let n = num;
        while (n >= 0) {
            id = String.fromCharCode(65 + (n % 26)) + id;
            n = Math.floor(n / 26) - 1;
        }
        return id;
    }

    function hideIcons(input: string): string {
        let result = '';
        let i = 0;
        while (i < input.length) {
            const remainingSlice = input.substring(i);
            let matchFound = false;
            for (const word of ALL_TRIGGER_WORDS) {
                if (remainingSlice.startsWith(word)) {
                    const nextCharIndex = i + word.length;
                    const nextChar = nextCharIndex < input.length ? input[nextCharIndex] : null;

                    if (word === 'Bag' && remainingSlice.startsWith('Bag of Flour')) {
                        continue;
                    }
                    if (word === 'Pet' && remainingSlice.startsWith('Pet Rock')) {
                        continue;
                    }

                    const isConcatenated = ALL_TRIGGER_WORDS.some(w => input.substring(nextCharIndex).startsWith(w));

                    if (!nextChar || !/[a-zA-Z]/.test(nextChar) || isConcatenated) {
                        const iconName = ALIAS_MAP[word] || word;
                        if (ICON_FILES.includes(iconName)) {
                            const alphaId = getAlphaId(iconCounter++);
                            const placeholder = `[[ICN${alphaId}]]`;
                            iconsMap.set(placeholder, createIconHtml(iconName, word));
                            result += placeholder;
                        } else {
                            result += word;
                        }
                        i += word.length;
                        matchFound = true;
                        break;
                    }
                }
            }
            if (!matchFound) {
                result += input[i];
                i++;
            }
        }
        return result;
    }

    processedText = hideIcons(processedText);

    // ШАГ 3: Заголовки
    processedText = processedText.replace(/(^|\n|\\n)(Quantity\s*:[^\n\\]*|[ \t]*• After[^:\n\\]+|(?![ \t]*[•+](?![^:\n\\]*:))(?!\s*•?\s*\d+%)(?!\s*If\b(?![^:\n\\]*:))[^:\n\\]+)(:|(?=\n)|$)/g, (...args) => {
        const start = args[1];
        const content = args[2];
        const end = args[args.length - 3] || '';

        if (!content.trim()) return args[0];

        // Ключевое изменение: строки "to:", а также условия с "more", "less" или "higher"
        // перед двоеточием не красятся как заголовки.
        const trimmedContent = content.trim();
        if (end === ':' && (/\bto$/i.test(trimmedContent) || /\b(more|less|higher|lower)\b/i.test(trimmedContent))) {
            return args[0];
        }

        // Если двоеточия нет, проверяем на глаголы-исключения
        if (!end && /\b(are|is|can|require|also|rerolls|gain|inflict|steal|benefits|counts)\b/i.test(content)) {
            return args[0];
        }

        return `${start}<span class="value-text">${content}${end}</span>`;
    });

    const replaceOutsideSpans = (str: string, regex: RegExp, handler: (...args: string[]) => string) => {
        const ignoreRegex = /(<span[^>]*>.*?<\/span>|\[\[ICN[A-Z]+]])/g;
        const combined = new RegExp(`(${ignoreRegex.source})|${regex.source}`, 'g');

        return str.replace(combined, (match, ignoreGroup, ...rest) => {
            if (ignoreGroup) return match;
            const groups = rest.filter(v => typeof v === 'string' && v !== str);
            return handler(...groups);
        });
    };

    // ШАГ 4: Проценты и скобки
    // Теперь захватывает скобки и проценты со знаком + или -
    processedText = replaceOutsideSpans(processedText, /(\(\s*[+-]\d+%.*?\))|([+-]?\d+%)/g, (match) => {
        return `<span class="value-text">${match}</span>`;
    });

    // ШАГ 5: Числа
    // Добавлены триггеры: enemy (для Sabotage) и min (для отрицательного урона)
    // Паттерн [+-]? теперь корректно захватывает знак перед числом
    const numberRegex = /(?<!\/)([+-]?[\d.]+(?:-[\d.]+)?|[\d.]+)(\s*)(%|seconds?|quantity|uses?|less|simple|common|magnetic|random|free|or|items?|more|by|max|min|enemy|\[\[ICN|[A-Z]|\)|$)/g;

    processedText = replaceOutsideSpans(processedText, numberRegex, (num, space, follow) => {
        if (follow === '%') return `<span class="value-text">${num}%</span>${space}`;
        return `<span class="value-text">${num}</span>${space}${follow}`;
    });

    // ШАГ 5.2: Специфический фикс для "by 1" (когда триггер СЛЕВА от числа)
    const byNumberRegex = /\b(by\s+)([\d.]+)\b/g;
    processedText = replaceOutsideSpans(processedText, byNumberRegex, (byPart, num) => {
        return `${byPart}<span class="value-text">${num}</span>`;
    });

    // ШАГ 5.3: Числа после первого слова
    const startOfLineNumberRegex = /(^|\n|\\n)([A-Z][a-z]+\s+)([\d.]+(?:-[\d.]+)?)/g;
    processedText = processedText.replace(startOfLineNumberRegex, (match, start, word, num) => {
        if (num.includes('span')) return match;
        return `${start}${word}<span class="value-text">${num}</span>`;
    });

    // ШАГ 6.1: Названия предметов (улучшенная поддержка апострофов и пробелов)
    const forbidden = ['Gain', 'Get', 'Give', 'Turn', 'Shoot', 'When', 'After', 'Every', 'Activate', 'Use', 'Steal', 'Have', 'Inflict', 'Remove', 'Trap', 'Cleanse', 'Become', 'Per', 'On', 'Increased', 'If', 'Reduce', 'Heal', 'Look', 'Spend', 'Deal', 'Next', 'Also', 'Increase', 'Transform', 'Your', 'That', 'The', 'Add', 'Transfer', 'Attract', 'Trigger', 'Both', 'Restore', 'Brings', 'Opponent', 'Crack', 'Find', 'Catch', 'No', 'Absorb', 'Block', 'Hits', 'Hammer', 'Break', 'Drain', 'Suffer', 'Void', 'Sabotage'];
    // Добавлена проверка (?<!\() — не брать слово, если перед ним скобка
    const itemNamesRegex = /(?<!\()\b([A-Z][a-z]+(?:['’]s)?((\s+of)?\s+[A-Z][a-z]+(?:['’]s)?)*)\b/g;

    processedText = replaceOutsideSpans(processedText, itemNamesRegex, (match) => {
        const firstWord = match.split(/\s+/)[0].replace(/['’]s$/, "");
        if (forbidden.includes(firstWord)) return match;
        return `<span class="value-text">${match}</span>`;
    });

    // ШАГ 6.2: Star + Предмет (Включая item/items)
    for (const [placeholder, html] of iconsMap.entries()) {
        if (html.includes('title="Star"')) {
            // Исправлено: поддержка items?
            const starWordRegex = new RegExp(`(${placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[ \xA0\t]*)(items?|Items?|[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'g');
            processedText = replaceOutsideSpans(processedText, starWordRegex, (starPart, fullName) => {
                return `${starPart}<span class="value-text">${fullName}</span>`;
            });
        }
    }

    // ШАГ 6.3: Ключевые слова
    const keywordsRegex = /\b(Discharge|common|magnetic|Sabotage|Lumps\s+of\s+Coal|Hunter['’]s\s+mark|Call\s+of\s+the\s+Void)\b/gi;
    processedText = replaceOutsideSpans(processedText, keywordsRegex, (match) => {
        return `<span class="value-text">${match}</span>`;
    });

    // Добавлен точечный фикс для разрыва Hunter's mark (если Шаг 6.1 его разделил)
    processedText = processedText.replace(/(<span class="value-text">Hunter['’]s<\/span>)\s+mark\b/gi, '$1 <span class="value-text">mark</span>');

    // ШАГ 6.4: per item/items
    const perItemRegex = /\b(per\s+)(items?)\b/gi;
    processedText = replaceOutsideSpans(processedText, perItemRegex, (per, item) => {
        return `${per}<span class="value-text">${item}</span>`;
    });

    // ШАГ 6.5: item/items после чисел или качества common
    // Теперь регулярка понимает, что между числом и item может быть слово "magnetic"
    const contextualItemRegex = /(<span class="value-text">[\d.-]+<\/span>\s*(?:magnetic\s+|common\s+|<span[^>]*>.*?<\/span>\s*)?|per\s+)(items?)\b/gi;

    processedText = processedText.replace(contextualItemRegex, (_match, prefix, item) => {
        return `${prefix}<span class="value-text">${item}</span>`;
    });

    // ШАГ 6.6: Окрашивание "This" в начале предложения
    // Красим только если это отдельно стоящее слово This в начале строки или после переноса
    const thisRegex = /(^|\n|\\n)(This)\b/g;
    processedText = replaceOutsideSpans(processedText, thisRegex, (start, word) => {
        return `${start}<span class="value-text">${word}</span>`;
    });

    // ШАГ 7: Возврат иконок
    iconsMap.forEach((html, placeholder) => {
        processedText = processedText.split(placeholder).join(html);
    });

    // Финальная очистка для Star item/items
    processedText = processedText.replace(/(title="Star".*?<\/picture>\s*)(items?|Items?)\b/g, '$1<span class="value-text">$2</span>');

    return processedText.replace(/\\n/g, '<br>');
}

export function generateIconsOrText(words: string[] | undefined): string {
    if (!words || words.length === 0) return '';
    const TYPE_SPECIFIC_ALIASES: { [key: string]: string } = {'Armor': 'TypeArmor'};
    return words.map(word => {
        const trimmedWord = word.trim();
        const iconName = TYPE_SPECIFIC_ALIASES[trimmedWord] || ALIAS_MAP[trimmedWord] || trimmedWord;
        if (ICON_FILES.includes(iconName)) return createIconHtml(iconName, trimmedWord);
        return `<span class="text-fallback">${trimmedWord}</span>`;
    }).join(' ');
}
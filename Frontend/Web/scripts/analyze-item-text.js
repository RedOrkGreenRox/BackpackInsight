import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_ROOT = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(WEB_ROOT, '..', '..');
const DB_DIR = path.join(PROJECT_ROOT, 'Backend', 'DB');
const OUT_DIR = path.join(WEB_ROOT, 'tmp');

const MIN_WORD_LENGTH = 2;
const TOP_LIMIT = Number(process.argv.find(arg => arg.startsWith('--top='))?.split('=')[1] || 250);

// Ручной список слишком общих токенов: служебные слова, числа словами,
// слишком частые слова интерфейса/описаний, которые плохо помогают семантическому поиску.
const MANUAL_STOPWORDS = new Set([
  // English function words / generic grammar
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'than', 'that', 'this', 'these', 'those',
  'to', 'of', 'in', 'on', 'for', 'from', 'with', 'without', 'within', 'into', 'by', 'at', 'as', 'is',
  'are', 'be', 'been', 'being', 'was', 'were', 'it', 'its', 'your', 'you', 'their', 'they', 'them',
  'self', 'own', 'all', 'any', 'each', 'every', 'per', 'while', 'during', 'after', 'before', 'until',
  'once', 'next', 'previous', 'current', 'same', 'other', 'another', 'additional', 'more', 'less',

  // Very common game-description verbs/connectors
  'when', 'whenever', 'upon', 'trigger', 'triggered', 'triggers', 'use', 'used', 'using', 'uses',
  'gain', 'gains', 'gained', 'get', 'gets', 'got', 'add', 'adds', 'added', 'give', 'gives', 'given',
  'remove', 'removes', 'removed', 'inflict', 'inflicts', 'inflicted', 'apply', 'applies', 'applied',
  'start', 'starts', 'started', 'end', 'ends', 'ended', 'enter', 'entered', 'entering', 'shop', 'shops',
  'round', 'rounds', 'battle', 'battles', 'combat', 'turn', 'turns', 'time', 'times', 'second', 'seconds',
  'chance', 'duration', 'cooldown', 'cost', 'value', 'base', 'bonus', 'amount', 'stack', 'stacks',
  'stacking', 'effect', 'effects', 'ability', 'abilities', 'description', 'level', 'levels', 'max',
  'min', 'target', 'targets', 'enemy', 'enemies', 'opponent', 'opponents', 'adjacent', 'nearby',
  'front', 'back', 'left', 'right', 'slot', 'slots', 'space', 'spaces', 'item', 'items', 'id', 'name',

  // Common JSON/data field fragments
  'true', 'false', 'null', 'undefined', 'nan', 'type', 'types', 'stats', 'stat', 'data', 'text',
  'tooltip', 'tooltips', 'shape', 'shapes', 'star', 'stars', 'source', 'unlock', 'connected', 'hero', 'rarity',
  'recipe', 'recipes', 'result', 'ingredient', 'ingredients', 'purchasable', 'coin', 'coins',
  'common', 'rare', 'epic', 'legendary', 'mythic', 'unique', 'relic', 'special', 'boon',
  'level', 'levels', 'change', 'changes', 'description', 'ability', 'breakpoint', 'base',
  'itemtype', 'itemtypes', 'itemshape', 'itemstars', 'unlocksource', 'connectedhero', 'coinvalue',
  'combatstats', 'allstats', 'maxlevel', 'resultid', 'ingredientids', 'abilitydescription',
  'basechance', 'chanceperlevel', 'chancebreakpointbonus', 'maxusecount', 'herolevel',
  'alwaysunlocked', 'default', 'shared',

  // Russian generic stopwords, just in case future data/localization is mixed in
  'и', 'или', 'но', 'если', 'то', 'это', 'этот', 'эта', 'эти', 'для', 'при', 'на', 'в', 'во', 'с', 'со',
  'без', 'из', 'от', 'до', 'по', 'за', 'над', 'под', 'как', 'же', 'ли', 'не', 'ни', 'да', 'нет', 'все',
  'каждый', 'каждая', 'каждое', 'раз', 'разы', 'секунда', 'секунды', 'уровень', 'предмет', 'предметы'
]);

function getLatestItemsFile() {
  const files = fs.readdirSync(DB_DIR)
    .filter(name => /^items_\d+_\d+_\d+\.json$/.test(name))
    .sort((a, b) => {
      const av = a.match(/items_(\d+)_(\d+)_(\d+)\.json/).slice(1).map(Number);
      const bv = b.match(/items_(\d+)_(\d+)_(\d+)\.json/).slice(1).map(Number);
      for (let i = 0; i < 3; i++) {
        if (av[i] !== bv[i]) return bv[i] - av[i];
      }
      return 0;
    });

  if (!files.length) throw new Error(`No items_*.json files found in ${DB_DIR}`);
  return path.join(DB_DIR, files[0]);
}

function addCount(map, key, inc = 1) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + inc);
}

function normalizeText(value) {
  return String(value)
    // Split common code-ish forms before lowercasing: criticalChance -> critical Chance, item_types -> item types.
    .replace(/([\p{Ll}])([\p{Lu}])/gu, '$1 $2')
    .replace(/[_/.-]+/g, ' ')
    .toLowerCase()
    .replaceAll('ё', 'е')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

function collectTextParts(value, out, includeKeys = true) {
  if (value == null) return;

  if (Array.isArray(value)) {
    for (const item of value) collectTextParts(item, out, includeKeys);
    return;
  }

  if (typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      if (includeKeys) out.push(key);
      collectTextParts(nested, out, includeKeys);
    }
    return;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    out.push(String(value));
  }
}

function tokenize(text) {
  return normalizeText(text)
    .split(/[^\p{L}]+/gu)
    .map(token => token.trim())
    .filter(Boolean);
}

function toSortedEntries(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const itemsFile = getLatestItemsFile();
const raw = JSON.parse(fs.readFileSync(itemsFile, 'utf-8'));
const items = Array.isArray(raw) ? raw : raw.items;

const charCounts = new Map();
const wordCountsRaw = new Map();
const wordCountsFiltered = new Map();

for (const item of items) {
  const parts = [];
  collectTextParts(item, parts, true);
  const text = parts.join(' ');
  const normalized = normalizeText(text);

  for (const char of normalized) {
    if (!/\s/u.test(char)) addCount(charCounts, char);
  }

  for (const token of tokenize(text)) {
    addCount(wordCountsRaw, token);

    if (token.length < MIN_WORD_LENGTH) continue;
    if (MANUAL_STOPWORDS.has(token)) continue;
    addCount(wordCountsFiltered, token);
  }
}

const charEntries = toSortedEntries(charCounts);
const rawWordEntries = toSortedEntries(wordCountsRaw);
const filteredWordEntries = toSortedEntries(wordCountsFiltered);

fs.mkdirSync(OUT_DIR, { recursive: true });
const report = {
  source: path.relative(PROJECT_ROOT, itemsFile),
  itemsCount: items.length,
  settings: {
    minWordLength: MIN_WORD_LENGTH,
    includeObjectKeys: true,
    stopwordsCount: MANUAL_STOPWORDS.size
  },
  chars: Object.fromEntries(charEntries),
  wordsRaw: Object.fromEntries(rawWordEntries),
  wordsFiltered: Object.fromEntries(filteredWordEntries)
};

const outFile = path.join(OUT_DIR, 'item-text-statistics.json');
fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');

function printTable(title, entries, limit = TOP_LIMIT) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
  for (const [token, count] of entries.slice(0, limit)) {
    let printable;
    if (token === '\n') printable = '\\n';
    else if (token === '\t') printable = '\\t';
    else printable = token;
    console.log(`${String(count).padStart(6)}  ${printable}`);
  }
}

console.log(`Source: ${path.relative(PROJECT_ROOT, itemsFile)}`);
console.log(`Items: ${items.length}`);
console.log(`Full JSON report: ${path.relative(PROJECT_ROOT, outFile)}`);

printTable(`Top ${Math.min(TOP_LIMIT, charEntries.length)} characters`, charEntries);
printTable(`Top ${Math.min(TOP_LIMIT, rawWordEntries.length)} raw words`, rawWordEntries);
printTable(`Top ${Math.min(TOP_LIMIT, filteredWordEntries.length)} filtered words`, filteredWordEntries);

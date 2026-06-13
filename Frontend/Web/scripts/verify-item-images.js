import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_ROOT = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(WEB_ROOT, '..', '..');
const DB_DIR = path.join(PROJECT_ROOT, 'Backend', 'DB');
const IMAGES_DIR = path.join(WEB_ROOT, 'static', 'images', 'items');

const MASKED_ITEMS = {
  'Suspicious Sausage': 'tender-sausage',
  'Fools Gold': 'gold-ore',
  'Feral Cat': 'black-cat',
  'Cursed Dagger': 'poison-dagger',
  'Book of Dark Secrets': 'dusty-book',
  'Blind Fury Potion': 'wrath-potion',
  'Feather of Icarus': 'phoenix-feather',
};

const ROMAN_NUMERALS = {
  I: 1, II: 2, III: 3, IV: 4, V: 5,
  VI: 6, VII: 7, VIII: 8, IX: 9, X: 10,
  XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15,
  XVI: 16, XVII: 17, XVIII: 18, XIX: 19, XX: 20,
};

function toSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’‘`´]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

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

function getImagePath(item) {
  if (MASKED_ITEMS[item.name]) return MASKED_ITEMS[item.name];

  const firstTooltip = item.tooltips?.[0];
  if (item.rarity === 'Special' && firstTooltip) {
    const match = firstTooltip.match(/^Step\s+(\d+|[IVXLCDM]+)/i);
    if (match?.[1]) {
      const token = match[1].toUpperCase();
      const number = ROMAN_NUMERALS[token] || Number.parseInt(token, 10);
      if (Number.isFinite(number)) return `heist-plan-${number}`;
    }
  }

  return toSlug(item.name);
}

const itemsFile = getLatestItemsFile();
const raw = JSON.parse(fs.readFileSync(itemsFile, 'utf-8'));
const items = Array.isArray(raw) ? raw : raw.items;
const missing = [];

for (const item of items) {
  const imagePath = getImagePath(item);
  for (const format of ['webp', 'avif']) {
    const imageFile = path.join(IMAGES_DIR, format, `${imagePath}.${format}`);
    if (!fs.existsSync(imageFile)) {
      missing.push({ item: item.name, format, expected: path.relative(PROJECT_ROOT, imageFile) });
    }
  }
}

if (missing.length) {
  console.error(`Missing item images: ${missing.length}`);
  for (const entry of missing.slice(0, 100)) {
    console.error(`- [${entry.format}] ${entry.item}: ${entry.expected}`);
  }
  if (missing.length > 100) console.error(`...and ${missing.length - 100} more`);
  process.exit(1);
}

console.log(`Item image audit OK: ${items.length} items checked (${path.basename(itemsFile)}).`);

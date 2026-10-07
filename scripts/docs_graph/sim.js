// Граф и силовая раскладка: узлы-документы отталкиваются, связи стягивают, кластеры (pack.js) держат свои скопления.
'use strict';

// Папка дока: своё скопление на карте и цвет ореола звезды.
const ZONES = {
  rust: { label: 'Backend', color: '--z-rust' },
  ts: { label: 'Frontend', color: '--z-ts' },
  py: { label: 'Python', color: '--z-py' },
  tools: { label: 'scripts и data', color: '--z-tools' },
  meta: { label: 'Корень docs', color: '--z-meta' },
};
// Язык описываемого файла: цвет ядра звезды.
const LANGS = {
  rust: { label: 'Rust', color: '--l-rust' },
  ts: { label: 'TS и JS', color: '--l-ts' },
  scss: { label: 'SCSS', color: '--l-scss' },
  py: { label: 'Python и PS', color: '--l-py' },
  data: { label: 'Конфиги и данные', color: '--l-data' },
  doc: { label: 'Папки и заметки', color: '--l-doc' },
};

// Виды связей — битовая маска из build: ссылка дока, импорт в коде или оба (совпадение доки и кода).
const KINDS = {
  3: { label: 'Ссылка и импорт', color: '--k-both' },
  1: { label: 'Только ссылка в доке', color: '--k-link' },
  2: { label: 'Только импорт в коде', color: '--k-import' },
};
const BAD = '--bad';

const G = {
  nodes: [], edges: [], byId: new Map(), hiddenZones: new Set(), hiddenLangs: new Set(), hiddenKinds: new Set(),
  showHubs: false, alpha: 1, onTick: null, root: null,
};

// Детерминированный генератор: раскладка одинакова при каждом открытии.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function buildGraph(data) {
  const css = getComputedStyle(document.documentElement);
  for (const t of [ZONES, LANGS, KINDS]) for (const v of Object.values(t)) v.rgb = css.getPropertyValue(v.color).trim();
  G.bad = css.getPropertyValue(BAD).trim();
  G.nodes = data.nodes.map((n, i) => ({ ...n, i, x: 0, y: 0, vx: 0, vy: 0, out: [], inc: [], deg: 0 }));
  G.edges = data.edges.map(([s, t, k]) => ({ s: G.nodes[s], t: G.nodes[t], k }));
  for (const e of G.edges) { e.s.out.push(e.t); e.t.inc.push(e.s); }
  for (const n of G.nodes) {
    n.deg = n.out.length + n.inc.length;
    n.r = 2.2 + Math.sqrt(n.deg) * 0.9;
    G.byId.set(n.id, n);
  }
}

const visible = (n) => !G.hiddenZones.has(n.zone) && !G.hiddenLangs.has(n.lang) && (G.showHubs || !n.hub);
const edgeOn = (e) => !G.hiddenKinds.has(e.k) && visible(e.s) && visible(e.t);

function reheat(a = 0.6) { G.alpha = Math.max(G.alpha, a); }

// Один шаг: отталкивание всех пар, пружины по связям (между кластерами слабее), притяжение к своему кластеру.
function tick() {
  const nodes = G.nodes.filter(visible);
  const a = G.alpha, n = nodes.length;
  for (let i = 0; i < n; i++) {
    const p = nodes[i];
    for (let j = i + 1; j < n; j++) {
      const q = nodes[j];
      let dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
      if (d2 > 8100) continue;
      if (d2 < 1) { dx = 0.5; dy = 0.5; d2 = 0.5; }
      const f = (220 * a) / d2;
      p.vx += dx * f; p.vy += dy * f; q.vx -= dx * f; q.vy -= dy * f;
    }
  }
  for (const e of G.edges) {
    if (!edgeOn(e)) continue;
    const dx = e.t.x - e.s.x, dy = e.t.y - e.s.y, d = Math.hypot(dx, dy) || 1;
    // Между кластерами пружина почти не тянет и делится на степень узла: индекс папки со ста ссылками
    // не должен утаскивать себя из своего кластера.
    const same = e.s.g === e.t.g, k = ((d - 46) / d) * (same ? 0.035 : 0.002) * a;
    const ws = (same ? 1 : 1 / Math.sqrt(1 + e.s.deg)) / Math.sqrt(1 + e.s.deg);
    const wt = (same ? 1 : 1 / Math.sqrt(1 + e.t.deg)) / Math.sqrt(1 + e.t.deg);
    e.s.vx += dx * k * ws; e.s.vy += dy * k * ws; e.t.vx -= dx * k * wt; e.t.vy -= dy * k * wt;
  }
  for (const p of nodes) {
    // Пружина к центру своего диска: внутри диска слабая (звёзды расходятся по нему), за краем жёсткая.
    const g = p.g, dx = g.ox - p.x, dy = g.oy - p.y, out = Math.hypot(dx, dy) > g.or;
    p.vx += dx * (out ? 0.15 : 0.006) * a; p.vy += dy * (out ? 0.15 : 0.006) * a;
    if (p.fixed) { p.vx = p.vy = 0; continue; }
    p.vx *= 0.62; p.vy *= 0.62;
    const sp = Math.hypot(p.vx, p.vy);
    if (sp > 40) { p.vx *= 40 / sp; p.vy *= 40 / sp; }
    p.x += p.vx; p.y += p.vy;
  }
  G.alpha *= 0.985;
}

// Прогоняет раскладку заранее, чтобы первый кадр уже был собранным графом, а не облаком.
function settle(steps) { for (let s = 0; s < steps; s++) tick(); }

function runSim() {
  const loop = () => {
    if (G.alpha > 0.004) tick();
    if (G.onTick) G.onTick();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// Граф и силовая раскладка: узлы-документы отталкиваются, ссылки стягивают, зоны держат свои скопления.
'use strict';

// Папка дока: своё скопление на карте и цвет ореола звезды.
const ZONES = {
  rust: { label: 'RBackend', color: '--z-rust' },
  ts: { label: 'Frontend', color: '--z-ts' },
  py: { label: 'Backend', color: '--z-py' },
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

const G = {
  nodes: [], edges: [], byId: new Map(), hiddenZones: new Set(), hiddenLangs: new Set(), showHubs: false,
  alpha: 1, onTick: null,
};

// Детерминированный генератор: раскладка одинакова при каждом открытии.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function buildGraph(data) {
  const css = getComputedStyle(document.documentElement);
  const zoneKeys = Object.keys(ZONES);
  zoneKeys.forEach((z, i) => {
    const a = (i / zoneKeys.length) * Math.PI * 2 - Math.PI / 2;
    ZONES[z].cx = Math.cos(a) * 520; ZONES[z].cy = Math.sin(a) * 520;
    ZONES[z].rgb = css.getPropertyValue(ZONES[z].color).trim();
  });
  for (const l of Object.values(LANGS)) l.rgb = css.getPropertyValue(l.color).trim();
  const rand = rng(7);
  G.nodes = data.nodes.map((n, i) => ({
    ...n, i, x: ZONES[n.zone].cx + (rand() - 0.5) * 300, y: ZONES[n.zone].cy + (rand() - 0.5) * 300,
    vx: 0, vy: 0, out: [], inc: [], deg: 0,
  }));
  G.edges = data.edges.map(([s, t]) => ({ s: G.nodes[s], t: G.nodes[t] }));
  for (const e of G.edges) { e.s.out.push(e.t); e.t.inc.push(e.s); }
  for (const n of G.nodes) {
    n.deg = n.out.length + n.inc.length;
    n.r = 2.2 + Math.sqrt(n.deg) * 0.9;
    G.byId.set(n.id, n);
  }
}

const visible = (n) => !G.hiddenZones.has(n.zone) && !G.hiddenLangs.has(n.lang) && (G.showHubs || !n.hub);
const edgeOn = (e) => visible(e.s) && visible(e.t);

function reheat(a = 0.6) { G.alpha = Math.max(G.alpha, a); }

// Один шаг: отталкивание всех пар, пружины по ссылкам, притяжение к центру своей зоны.
function tick() {
  const nodes = G.nodes.filter(visible);
  const a = G.alpha, n = nodes.length;
  for (let i = 0; i < n; i++) {
    const p = nodes[i];
    for (let j = i + 1; j < n; j++) {
      const q = nodes[j];
      let dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
      if (d2 > 160000) continue;
      if (d2 < 1) { dx = 0.5; dy = 0.5; d2 = 0.5; }
      const f = (900 * a) / d2;
      p.vx += dx * f; p.vy += dy * f; q.vx -= dx * f; q.vy -= dy * f;
    }
  }
  for (const e of G.edges) {
    if (!edgeOn(e)) continue;
    const dx = e.t.x - e.s.x, dy = e.t.y - e.s.y, d = Math.hypot(dx, dy) || 1;
    const k = ((d - 46) / d) * 0.035 * a;
    const ws = 1 / Math.sqrt(1 + e.s.deg), wt = 1 / Math.sqrt(1 + e.t.deg);
    e.s.vx += dx * k * wt; e.s.vy += dy * k * wt; e.t.vx -= dx * k * ws; e.t.vy -= dy * k * ws;
  }
  for (const p of nodes) {
    const z = ZONES[p.zone];
    p.vx += (z.cx * 0.7 - p.x) * 0.012 * a; p.vy += (z.cy * 0.7 - p.y) * 0.012 * a;
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

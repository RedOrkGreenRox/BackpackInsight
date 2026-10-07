// Кластеры: дерево групп по папкам, вес группы — число видимых звёзд, упаковка кругов от тяжёлых к лёгким.
'use strict';

const NODE_AREA = 22;   // радиус диска растёт как NODE_AREA·√(звёзд)
const GAPS = [90, 40, 18]; // зазор между соседними кругами по глубине: верхние группы расходятся сильнее
const PROBLEM_GAP = 420; // кластер «Проблемы» держится дальше остальных

function buildGroups() {
  const make = (name, parent) => ({ name, parent, kids: new Map(), nodes: [], depth: parent ? parent.depth + 1 : 0 });
  G.root = make('', null);
  for (const n of G.nodes) {
    let g = G.root;
    for (const part of n.group) {
      if (!g.kids.has(part)) g.kids.set(part, make(part, g));
      g = g.kids.get(part);
    }
    g.nodes.push(n); n.g = g;
  }
}

const isProblem = (g) => g.depth === 1 && g.name === 'Проблемы';

// Плотная упаковка: каждый следующий (более лёгкий) круг касается одного или двух уже поставленных
// и встаёт как можно ближе к центру, поэтому тяжёлые группы в середине, лёгкие по краю.
function packCircles(items, gap) {
  const placed = [], far = (it) => it.g && isProblem(it.g);
  const need = (p, it) => p.r + it.r + (far(p) || far(it) ? PROBLEM_GAP : gap);
  const fits = (it, x, y) => placed.every((p) => Math.hypot(p.x - x, p.y - y) >= need(p, it) - 0.01);
  for (const it of items) {
    let best = placed.length ? null : [0, 0];
    const tryAt = (x, y) => { if (fits(it, x, y) && (!best || Math.hypot(x, y) < Math.hypot(...best))) best = [x, y]; };
    for (const p of placed) {
      for (let a = 0; a < 6.28; a += 0.5) tryAt(p.x + Math.cos(a) * need(p, it), p.y + Math.sin(a) * need(p, it));
      for (const q of placed) {
        if (q === p) continue;
        // Точки касания сразу двух кругов: пересечение окружностей радиусов need(p) и need(q).
        const d = Math.hypot(q.x - p.x, q.y - p.y), ra = need(p, it), rb = need(q, it);
        if (!d || d > ra + rb || d < Math.abs(ra - rb)) continue;
        const l = (ra * ra - rb * rb + d * d) / (2 * d), h = Math.sqrt(Math.max(0, ra * ra - l * l));
        const mx = p.x + ((q.x - p.x) * l) / d, my = p.y + ((q.y - p.y) * l) / d;
        tryAt(mx + ((q.y - p.y) * h) / d, my - ((q.x - p.x) * h) / d);
        tryAt(mx - ((q.y - p.y) * h) / d, my + ((q.x - p.x) * h) / d);
      }
    }
    [it.x, it.y] = best; placed.push(it);
  }
  // Центр группы — середина габарита, радиус — до самого дальнего края.
  const xs = placed.flatMap((p) => [p.x - p.r, p.x + p.r]), ys = placed.flatMap((p) => [p.y - p.r, p.y + p.r]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  for (const p of placed) { p.x -= cx; p.y -= cy; }
  return placed.reduce((m, p) => Math.max(m, Math.hypot(p.x, p.y) + p.r), 0);
}

// Снизу вверх: вес и радиус каждой группы; свои звёзды группы — отдельный диск среди подгрупп.
function measure(g) {
  const items = [];
  g.weight = 0;
  for (const kid of g.kids.values()) {
    measure(kid);
    if (kid.weight) { items.push({ g: kid, r: kid.r, w: kid.weight }); g.weight += kid.weight; }
  }
  const own = g.nodes.filter(visible).length;
  g.or = own ? NODE_AREA * Math.sqrt(own) + 8 : 0;
  if (own) { items.push({ own: true, r: g.or, w: own }); g.weight += own; }
  // Тяжёлые в центре; «Проблемы» всегда последними, на отшибе.
  items.sort((p, q) => (Boolean(p.g && isProblem(p.g)) - Boolean(q.g && isProblem(q.g))) || q.w - p.w);
  g.items = items;
  g.r = items.length ? packCircles(items, GAPS[Math.min(g.depth, GAPS.length - 1)]) + (g.depth ? 10 : 0) : 0;
}

// Сверху вниз: абсолютные центры групп и их дисков звёзд.
function place(g, x, y) {
  g.cx = x; g.cy = y; g.ox = x; g.oy = y;
  for (const it of g.items) {
    if (it.own) { g.ox = x + it.x; g.oy = y + it.y; } else place(it.g, x + it.x, y + it.y);
  }
}

// Пересчитывает кластеры под текущие фильтры; first — ещё и расставляет звёзды по их дискам.
function repack(first) {
  measure(G.root);
  place(G.root, 0, 0);
  if (!first) return;
  const rand = rng(7);
  for (const n of G.nodes) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * n.g.or;
    n.x = n.g.ox + Math.cos(a) * d; n.y = n.g.oy + Math.sin(a) * d;
  }
}

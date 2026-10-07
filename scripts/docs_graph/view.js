// Холст: камера (сдвиг и масштаб), отрисовка звёзд и связей, мышь и пальцы.
'use strict';

const V = { cam: { x: 0, y: 0, k: 0.7 }, hover: null, selected: null, dirty: true, w: 0, h: 0, dpr: 1 };
const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
// Один генератор на всю пыль: соседние зёрна дают похожие числа и выстраивают точки в полосы.
const dustRng = rng(7), dust = Array.from({ length: 220 }, () => [dustRng(), dustRng(), dustRng()]);

function resize() {
  V.dpr = Math.min(window.devicePixelRatio || 1, 2);
  V.w = canvas.clientWidth; V.h = canvas.clientHeight;
  canvas.width = V.w * V.dpr; canvas.height = V.h * V.dpr;
  updateZoomLimits();
  V.dirty = true;
}
const toScreenXY = (x, y) => [(x - V.cam.x) * V.cam.k + V.w / 2, (y - V.cam.y) * V.cam.k + V.h / 2];
const toScreen = (n) => toScreenXY(n.x, n.y);
const toWorld = (sx, sy) => [(sx - V.w / 2) / V.cam.k + V.cam.x, (sy - V.h / 2) / V.cam.k + V.cam.y];

function nodeAt(sx, sy) {
  const [wx, wy] = toWorld(sx, sy);
  let best = null, bestD = (14 / V.cam.k) ** 2;
  for (const n of G.nodes) {
    if (!visible(n)) continue;
    const d = (n.x - wx) ** 2 + (n.y - wy) ** 2;
    if (d < Math.max(bestD, n.r * n.r)) { best = n; bestD = d; }
  }
  return best;
}

function focusSet() {
  const f = V.hover || V.selected;
  return f ? new Set([f, ...f.out, ...f.inc]) : null;
}

function draw() {
  ctx.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
  ctx.clearRect(0, 0, V.w, V.h);
  for (const [x, y, b] of dust) {
    ctx.fillStyle = `rgba(200,210,255,${0.05 + b * 0.12})`;
    ctx.fillRect(x * V.w, y * V.h, 1.2, 1.2);
  }
  const focus = focusSet(), f = V.hover || V.selected, k = V.cam.k;
  drawGroups(ctx, toScreenXY, k);
  drawEdges(ctx, toScreen, k, f, focus);
  for (const n of G.nodes) {
    if (!visible(n)) continue;
    const [x, y] = toScreen(n), r = n.r * Math.sqrt(k) + 0.6, dim = focus && !focus.has(n);
    if (x < -20 || y < -20 || x > V.w + 20 || y > V.h + 20) continue;
    // Ореол — цвет папки дока, ядро — цвет языка файла; у проблемных звёзд оба красные.
    const bad = n.bad.length > 0;
    ctx.fillStyle = bad ? G.bad : ZONES[n.zone].rgb;
    ctx.globalAlpha = dim ? 0.05 : 0.22;
    ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, 7); ctx.fill();
    ctx.globalAlpha = dim ? 0.2 : 0.9;
    ctx.beginPath(); ctx.arc(x, y, r + 1.6, 0, 7); ctx.fill();
    ctx.fillStyle = bad ? '#ffd0d4' : LANGS[n.lang].rgb;
    ctx.globalAlpha = dim ? 0.25 : 1;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    if (n === V.selected) {
      ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = 1.5; ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(x, y, r + 4, 0, 7); ctx.stroke(); ctx.lineWidth = Math.max(0.4, 0.7 * Math.sqrt(k));
    }
  }
  ctx.globalAlpha = 1;
  drawLabels(ctx, toScreen, k, f, focus);
  V.dirty = false;
}

function flyTo(n, k) {
  const from = { ...V.cam }, to = { x: n.x, y: n.y, k: clampZoom(k || Math.max(V.cam.k, 1.6)) };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now(), dur = reduce ? 1 : 520;
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dur), e = 1 - (1 - p) ** 3;
    V.cam.x = from.x + (to.x - from.x) * e; V.cam.y = from.y + (to.y - from.y) * e;
    V.cam.k = from.k + (to.k - from.k) * e; V.dirty = true;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const ptrs = new Map();
let drag = null;
canvas.addEventListener('pointerdown', (ev) => {
  canvas.setPointerCapture(ev.pointerId);
  ptrs.set(ev.pointerId, [ev.offsetX, ev.offsetY]);
  const hit = ptrs.size === 1 ? nodeAt(ev.offsetX, ev.offsetY) : null;
  drag = { node: hit, x: ev.offsetX, y: ev.offsetY, moved: 0, pinch: null };
  if (hit) { hit.fixed = true; reheat(0.15); }
  canvas.classList.add('dragging');
});
canvas.addEventListener('pointermove', (ev) => {
  if (!drag) { const h = nodeAt(ev.offsetX, ev.offsetY); if (h !== V.hover) { V.hover = h; V.dirty = true; } return; }
  const prev = ptrs.get(ev.pointerId); if (!prev) return;
  ptrs.set(ev.pointerId, [ev.offsetX, ev.offsetY]);
  if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (drag.pinch) zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, d / drag.pinch);
    drag.pinch = d; drag.moved = 99; return;
  }
  const dx = ev.offsetX - prev[0], dy = ev.offsetY - prev[1];
  drag.moved += Math.abs(dx) + Math.abs(dy);
  if (drag.node) { const [wx, wy] = toWorld(ev.offsetX, ev.offsetY); drag.node.x = wx; drag.node.y = wy; reheat(0.15); }
  else { V.cam.x -= dx / V.cam.k; V.cam.y -= dy / V.cam.k; }
  V.dirty = true;
});
const release = (ev) => {
  ptrs.delete(ev.pointerId);
  if (!drag || ptrs.size) return;
  if (drag.node) drag.node.fixed = false;
  if (drag.moved < 6) select(drag.node);
  drag = null; canvas.classList.remove('dragging');
};
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
canvas.addEventListener('pointerleave', () => { if (!drag && V.hover) { V.hover = null; V.dirty = true; } });

function zoomAt(sx, sy, factor) {
  const [wx, wy] = toWorld(sx, sy);
  V.cam.k = clampZoom(V.cam.k * factor);
  const [nx, ny] = toWorld(sx, sy);
  V.cam.x += wx - nx; V.cam.y += wy - ny; V.dirty = true;
}
canvas.addEventListener('wheel', (ev) => { ev.preventDefault(); zoomAt(ev.offsetX, ev.offsetY, Math.exp(-ev.deltaY * 0.0015)); }, { passive: false });
window.addEventListener('resize', resize);

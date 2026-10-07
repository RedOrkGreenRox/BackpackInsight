// Подписи звёзд с расталкиванием: подписи отодвигаются друг от друга и тянутся обратно к своей звезде.
'use strict';

const LABEL_H = 15;     // высота строки подписи с запасом
const LABEL_MAX = 90;   // больше подписей за кадр не раскладываем: O(n²) на шаг
const LABEL_STEPS = 24; // шагов расталкивания за кадр
const LABEL_LEASH = 70; // дальше от звезды подпись не уводим; не влезла — не показываем

// Кандидаты: звезда в фокусе первой, дальше по числу связей; в общем виде их число растёт с масштабом.
function labelCandidates(ctx, toScreen, k, f, focus) {
  const pool = (focus ? [...focus] : G.nodes.filter(visible)).sort((p, q) => (q === f) - (p === f) || q.deg - p.deg);
  const limit = Math.min(LABEL_MAX, focus ? LABEL_MAX : Math.round(16 + 45 * k * k));
  const out = [];
  for (const n of pool) {
    if (out.length >= limit) break;
    const [sx, sy] = toScreen(n);
    if (sx < 0 || sy < 0 || sx > V.w || sy > V.h) continue;
    const text = n.title.length > 38 ? n.title.slice(0, 36) + '…' : n.title;
    const ay = sy - n.r * Math.sqrt(k) - 7;
    out.push({ n, text, sx, sy, ax: sx, ay, x: sx, y: ay, half: ctx.measureText(text).width / 2 + 4, rank: out.length });
  }
  return out;
}

// Расталкивание: пересекающиеся рамки расходятся по оси меньшего перекрытия, причём сдвигается
// в основном менее важная подпись; каждая подпись пружинит к месту над своей звездой и не выходит за экран.
function relax(items) {
  for (let step = 0; step < LABEL_STEPS; step++) {
    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      for (let j = i + 1; j < items.length; j++) {
        const b = items[j], ox = a.half + b.half - Math.abs(a.x - b.x), oy = LABEL_H - Math.abs(a.y - b.y);
        if (ox <= 0 || oy <= 0) continue;
        const wa = a.rank === 0 ? 0 : 0.3, wb = 1 - wa;
        if (oy < ox) { const s = Math.sign(b.y - a.y || 1) * oy; a.y -= s * wa; b.y += s * wb; }
        else { const s = Math.sign(b.x - a.x || 1) * ox; a.x -= s * wa; b.x += s * wb; }
      }
    }
    // Подписи кластеров неподвижны: подпись звезды целиком уходит от них сама.
    for (const it of items) {
      for (const o of G.obstacles || []) {
        const ox = o.half + it.half - Math.abs(o.x - it.x), oy = (o.h + LABEL_H) / 2 - Math.abs(o.y - it.y);
        if (ox <= 0 || oy <= 0) continue;
        if (oy < ox) it.y += Math.sign(it.y - o.y || 1) * oy; else it.x += Math.sign(it.x - o.x || 1) * ox;
      }
      it.x += (it.ax - it.x) * 0.08; it.y += (it.ay - it.y) * 0.08;
      it.x = Math.min(Math.max(it.x, it.half), V.w - it.half); it.y = Math.min(Math.max(it.y, LABEL_H), V.h - 4);
    }
  }
  // Что так и не разошлось или улетело далеко от звезды — убираем, начиная с менее важных.
  const kept = [];
  for (const it of items) {
    const far = Math.hypot(it.x - it.ax, it.y - it.ay) > LABEL_LEASH;
    const hit = [...kept, ...(G.obstacles || [])]
      .some((p) => Math.abs(p.x - it.x) < p.half + it.half - 2 && Math.abs(p.y - it.y) < ((p.h || LABEL_H) + LABEL_H) / 2 - 3);
    if (!far && !hit) kept.push(it);
  }
  return kept;
}

function drawLabels(ctx, toScreen, k, f, focus) {
  ctx.font = '500 11.5px "Golos Text", system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (const it of relax(labelCandidates(ctx, toScreen, k, f, focus))) {
    // Сдвинутая подпись соединяется со своей звездой тонкой линией.
    if (Math.hypot(it.x - it.ax, it.y - it.ay) > 9) {
      ctx.globalAlpha = 0.35; ctx.strokeStyle = '#e6e9f5'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(it.sx, it.sy); ctx.lineTo(it.x, it.y + 3); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(7,11,23,.75)';
    ctx.fillText(it.text, it.x + 1, it.y + 1);
    ctx.fillStyle = it.n === f ? '#ffd98a' : '#e6e9f5';
    ctx.fillText(it.text, it.x, it.y);
  }
}

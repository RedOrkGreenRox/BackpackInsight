// Фоновые слои холста под звёздами: контуры кластеров с подписями и связи трёх видов.
'use strict';

// Контуры кластеров и их подписи: верхний уровень виден всегда, вложенные — по мере приближения.
function drawGroups(ctx, toScreenXY, k) {
  const walk = (g) => {
    for (const kid of g.kids.values()) {
      if (!kid.weight) continue;
      const [x, y] = toScreenXY(kid.cx, kid.cy), r = kid.r * k, bad = isProblem(kid) || kid.parent && isProblem(kid.parent);
      // Кластеры стилей видны на любом масштабе и обведены цветом SCSS, чтобы отличать их от кода рядом.
      const style = kid.name === 'Стили', main = kid.depth === 1 || style;
      if (main || r > 70 * kid.depth) {
        const color = bad ? G.bad : style ? LANGS.scss.rgb : 'rgba(170,185,255,1)';
        ctx.globalAlpha = main ? 0.3 : 0.16;
        ctx.strokeStyle = color;
        ctx.lineWidth = main ? 1.2 : 0.8;
        ctx.setLineDash(main ? [] : [3, 5]);
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
        const size = kid.depth === 1 ? 15 : 12;
        ctx.globalAlpha = main ? 0.8 : 0.55;
        ctx.font = `600 ${size}px "Unbounded", "Golos Text", system-ui, sans-serif`;
        ctx.fillStyle = bad || style ? color : '#c9d1f2';
        // Подпись большого круга — внутри у верхней кромки, маленького — над ним.
        ctx.fillText(`${kid.name} · ${kid.weight}`, x, r > 90 ? y - r + size + 10 : y - r - 6);
      }
      walk(kid);
    }
  };
  ctx.save(); ctx.textAlign = 'center'; walk(G.root);
  // Свои звёзды корня (заметки в docs/ без папки) — диск без круга-группы: подписываем его отдельно.
  if (G.root.or) {
    const [x, y] = toScreenXY(G.root.ox, G.root.oy);
    ctx.globalAlpha = 0.75; ctx.fillStyle = '#c9d1f2';
    ctx.font = '600 15px "Unbounded", "Golos Text", system-ui, sans-serif';
    ctx.fillText(`docs · ${G.root.nodes.filter(visible).length}`, x, y - G.root.or * k - 8);
  }
  ctx.restore();
}

function drawEdges(ctx, toScreen, k, f, focus) {
  // Связи по видам: «только импорт» пунктиром — зависимость в коде, о которой молчит документация.
  for (const kind of [1, 3, 2]) {
    ctx.setLineDash(kind === 2 ? [4, 4] : []);
    ctx.lineWidth = Math.max(0.4, (kind === 3 ? 1 : 0.7) * Math.sqrt(k));
    ctx.strokeStyle = KINDS[kind].rgb;
    for (const e of G.edges) {
      if (e.k !== kind || !edgeOn(e)) continue;
      const hot = f && (e.s === f || e.t === f);
      ctx.globalAlpha = hot ? 0.9 : focus ? 0.03 : kind === 1 ? 0.09 : 0.16;
      const [x1, y1] = toScreen(e.s), [x2, y2] = toScreen(e.t);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
  }
  ctx.setLineDash([]);
}

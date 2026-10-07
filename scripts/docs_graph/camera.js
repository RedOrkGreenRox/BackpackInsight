// Камера: кадр «весь граф» и пределы масштаба, которые зависят от размера графа и экрана.
'use strict';

const NEIGHBOUR = 30;     // типичное расстояние между соседними звёздами в единицах графа
const CLOSEST = 6;        // при наибольшем приближении на меньшей стороне экрана ~6 соседей
const FARTHEST = 0.5;     // наибольшее отдаление — весь граф занимает половину свободного места

// Свободная от панели поиска часть экрана: справа на ПК, снизу на телефоне.
function freeArea() {
  const hud = document.getElementById('hud').getBoundingClientRect(), wide = V.w > 760;
  return wide ? { w: V.w - hud.right, h: V.h, dx: hud.right / 2, dy: 0 }
    : { w: V.w, h: V.h - hud.bottom, dx: 0, dy: hud.bottom / 2 };
}

// Масштаб, при котором все видимые звёзды помещаются в свободную часть, и центр этого кадра.
function fitFrame() {
  const shown = G.nodes.filter(visible), area = freeArea();
  if (!shown.length) return { k: 1, x: 0, y: 0, area };
  const xs = shown.map((n) => n.x), ys = shown.map((n) => n.y);
  const x = (Math.min(...xs) + Math.max(...xs)) / 2, y = (Math.min(...ys) + Math.max(...ys)) / 2;
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1);
  return { k: (Math.min(area.w, area.h) / span) * 0.92, x, y, area };
}

// Пределы пересчитываются при смене фильтров и размера окна: маленький граф не уводится в точку,
// а приблизиться можно ровно настолько, чтобы на экране оставалось несколько соседей.
function updateZoomLimits() {
  const fit = fitFrame(), side = Math.min(V.w, V.h);
  V.kMin = fit.k * FARTHEST;
  V.kMax = Math.max(fit.k * 2, side / (CLOSEST * NEIGHBOUR));
  V.cam.k = clampZoom(V.cam.k);
}

const clampZoom = (k) => Math.min(V.kMax || 6, Math.max(V.kMin || 0.05, k));

function fitCamera() {
  const fit = fitFrame();
  V.cam.k = clampZoom(fit.k);
  V.cam.x = fit.x - fit.area.dx / V.cam.k; V.cam.y = fit.y - fit.area.dy / V.cam.k;
  V.dirty = true;
}

// Панель документа (маленький рендер Markdown), поиск, легенда (на телефоне свёрнута) и запуск страницы.
'use strict';

const $ = (id) => document.getElementById(id);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Путь ссылки относительно документа → id узла (путь от корня репозитория).
function resolvePath(base, target) {
  const clean = target.split('#')[0];
  if (!clean) return base;
  const parts = clean.startsWith('/') ? [] : base.split('/').slice(0, -1);
  for (const p of clean.replace(/^\/+/, '').split('/')) {
    if (p === '..') parts.pop(); else if (p && p !== '.') parts.push(p);
  }
  return parts.join('/');
}

function inline(s, base) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/\[((?:\[\[[^\]]*\]\]|[^\]])*)\]\(([^)\s]+)\)/g, (_, text, href) => {
      if (/^https?:/.test(href)) return `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
      const id = resolvePath(base, href.replace(/&amp;/g, '&'));
      return G.byId.has(id) ? `<a data-doc="${esc(id)}" tabindex="0">${text}</a>` : `<code>${text}</code>`;
    });
}

function markdown(src, base) {
  const out = [], lines = src.split('\n');
  let list = null, i = 0;
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('```')) {
      closeList(); const code = [];
      while (++i < lines.length && !lines[i].startsWith('```')) code.push(lines[i]);
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`); i++; continue;
    }
    if (/^\s*\|/.test(line)) {
      closeList(); const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => inline(c.trim(), base));
      const body = rows.filter((r) => !/^\s*\|[\s:|-]+\|\s*$/.test(r)).map(cells);
      out.push('<div class="tbl"><table>' + body.map((r, n) =>
        '<tr>' + r.map((c) => (n ? `<td>${c}</td>` : `<th>${c}</th>`)).join('') + '</tr>').join('') + '</table></div>');
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)/), li = line.match(/^\s*(?:[-*]|(\d+)\.)\s+(.*)/);
    if (h) { closeList(); out.push(`<h${h[1].length}>${inline(h[2], base)}</h${h[1].length}>`); }
    else if (li) {
      const kind = li[1] ? 'ol' : 'ul';
      if (list !== kind) { closeList(); out.push(`<${kind}>`); list = kind; }
      out.push(`<li>${inline(li[2], base)}</li>`);
    } else if (/^---+\s*$/.test(line)) { closeList(); out.push('<hr>'); }
    else if (line.startsWith('>')) { closeList(); out.push(`<blockquote>${inline(line.replace(/^>\s?/, ''), base)}</blockquote>`); }
    else if (line.trim()) { closeList(); out.push(`<p>${inline(line, base)}</p>`); }
    else closeList();
    i++;
  }
  closeList();
  return out.join('');
}

function select(n, fly) {
  V.selected = n; V.dirty = true;
  const panel = $('doc');
  if (!n) { panel.hidden = true; return; }
  const z = ZONES[n.zone], l = LANGS[n.lang];
  panel.style.setProperty('--c', n.bad.length ? G.bad : l.rgb);
  $('doc-zone').textContent = n.bad.length ? `Проблема: ${n.bad.join(', ')}` : `${l.label} · ${z.label}`;
  $('doc-title').textContent = n.title;
  $('doc-path').textContent = n.code ? n.id : n.src ? `${n.id}  →  ${n.src}` : n.id;
  $('doc-links').textContent = `Связи: исходящих ${n.out.length} · входящих ${n.inc.length}`;
  $('md').innerHTML = n.code ? '<p>У этого исходника нет зеркального документа.</p>'
    : markdown(n.text.split('\n').slice(1).join('\n'), n.id);
  $('md').scrollTop = 0;
  panel.hidden = false;
  if (fly) flyTo(n);
}

$('md').addEventListener('click', (ev) => {
  const a = ev.target.closest('a[data-doc]');
  if (a) select(G.byId.get(a.dataset.doc), true);
});
$('md').addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.dataset.doc) ev.target.click(); });
$('doc-close').addEventListener('click', () => select(null));
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') select(null); });

$('search').addEventListener('input', () => {
  const q = $('search').value.trim().toLowerCase(), hits = $('hits');
  hits.innerHTML = '';
  if (!q) { hits.hidden = true; return; }
  const found = G.nodes.filter((n) => (n.title + ' ' + n.id + ' ' + (n.src || '')).toLowerCase().includes(q))
    .sort((a, b) => b.deg - a.deg).slice(0, 12);
  for (const n of found) {
    const li = document.createElement('li'), b = document.createElement('button');
    b.innerHTML = `<span>${esc(n.title)}</span><small>${esc(n.id.replace(/^docs\//, ''))}</small>`;
    b.addEventListener('click', () => { G.hiddenZones.delete(n.zone); G.hiddenLangs.delete(n.lang); if (n.hub) G.showHubs = true; renderLegend(); repack(false); select(n, true); });
    li.append(b); hits.append(li);
  }
  hits.hidden = !found.length;
});

function renderLegend() {
  const box = $('legend'); box.innerHTML = '';
  const head = (text) => { const b = document.createElement('b'); b.textContent = text; box.append(b); };
  const chip = (label, color, on, toggle, ring) => {
    const b = document.createElement('button');
    b.className = ring ? 'chip ring' : 'chip'; b.setAttribute('aria-pressed', String(on));
    b.style.setProperty('--c', color); b.innerHTML = `<i></i>${esc(label)}`;
    b.addEventListener('click', () => { toggle(); renderLegend(); repack(false); updateZoomLimits(); reheat(0.5); V.dirty = true; });
    box.append(b);
  };
  const group = (title, table, key, hidden, ring) => {
    head(title);
    for (const [k, z] of Object.entries(table)) {
      const count = G.nodes.filter((n) => n[key] === k).length;
      if (count) chip(`${z.label} · ${count}`, z.rgb, !hidden.has(k), () => (hidden.has(k) ? hidden.delete(k) : hidden.add(k)), ring);
    }
  };
  group('Язык файла — ядро', LANGS, 'lang', G.hiddenLangs, false);
  group('Папка дока — ореол', ZONES, 'zone', G.hiddenZones, true);
  head('Связи');
  for (const [k, kind] of Object.entries(KINDS)) {
    const key = Number(k), count = G.edges.filter((e) => e.k === key).length;
    chip(`${kind.label} · ${count}`, kind.rgb, !G.hiddenKinds.has(key),
      () => (G.hiddenKinds.has(key) ? G.hiddenKinds.delete(key) : G.hiddenKinds.add(key)));
  }
  chip('Карты README и structure', '#ffd98a', G.showHubs, () => { G.showHubs = !G.showHubs; });
}

buildGraph(DATA); buildGroups(); repack(true); settle(260);
const badCount = G.nodes.filter((n) => n.bad.length).length;
$('stats').textContent = `${G.nodes.length} звёзд · ${G.edges.length} связей · проблемных ${badCount}`;
renderLegend();
if (innerWidth <= 760) $('filters').open = false;
resize();
updateZoomLimits();
fitCamera();
G.onTick = () => { if (G.alpha > 0.004 || V.dirty) draw(); };
runSim();

/* Lecture 13 pieces shared by the lecture deck and Class Exercise 13 (m4-l3-exercises). */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const say = (el, msg, kind = '') => { if (el) { el.textContent = msg; el.className = `status ${kind}`; } };
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* === FLIP CARDS === */
export const flipCard = ({ term, definition, example, significance, back = 'Example', hint = 'Tap for example' }, icon = '', cls = '') => `
  <div class="vcard${cls ? ' ' + cls : ''}" tabindex="0" role="button" aria-label="${esc(term)}: show example">
    <div class="in">
      <div class="f"><h4${icon ? ' class="ih"' : ''}>${icon}${esc(term)}</h4>${definition}<span class="hint">${esc(hint)}</span></div>
      <div class="b"><h4>${esc(back)}</h4><p>${esc(example)}</p>${significance ? `<p style="margin-top:14px;opacity:.85"><b>Why it matters:</b> ${esc(significance)}</p>` : ''}</div>
    </div>
  </div>`;
export function wireFlips(root) {
  $$('.vcard', root).forEach(c => {
    const flip = () => c.classList.toggle('flip');
    c.addEventListener('click', flip);
    c.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); flip(); } });
  });
}

/* === QUICK QUESTIONS === tap to reveal, checked in the browser only */
export function wireReveals() {
  $$('[data-def]').forEach(c => {
    c.style.cursor = 'pointer'; c.tabIndex = 0;
    const t = () => c.classList.toggle('open');
    c.addEventListener('click', t);
    c.addEventListener('keydown', e => { if (e.key === 'Enter') t(); });
  });
}

/* === CAUSAL LOOP DIAGRAM === nodes [id, label (| breaks lines), x, y, width, class];
   links [from, to, sign, bend]; loops [letter, x, y]. Same drawing as Lecture 12. */
export function cld(svg, { nodes, links, loops = [] }, opts = {}) {
  const N = Object.fromEntries(nodes.map(([id, label, x, y, w = 250, cls = '']) => [id, { id, label, x, y, w, h: label.includes('|') ? 86 : 60, cls }]));
  const edge = (n, px, py) => {
    const dx = px - n.x, dy = py - n.y;
    const t = Math.min((n.w / 2 + 10) / Math.abs(dx || 1e-6), (n.h / 2 + 10) / Math.abs(dy || 1e-6));
    return [n.x + dx * t, n.y + dy * t];
  };
  const id = svg.id;
  let out = `<defs><marker id="${id}-ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z" fill="#5d7780"/></marker></defs>`;
  links.forEach(([a, b, sign, bend = 40], i) => {
    const A = N[a], B = N[b];
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, len = Math.hypot(B.x - A.x, B.y - A.y);
    const cx = mx - (B.y - A.y) / len * bend, cy = my + (B.x - A.x) / len * bend;
    const [x0, y0] = edge(A, cx, cy), [x2, y2] = edge(B, cx, cy);
    const q = t => [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y2];
    const [sx, sy] = q(.72);
    out += `<g class="s lk" style="--i:${opts.seq ? i : 0}"><path d="M${x0.toFixed(1)} ${y0.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" marker-end="url(#${id}-ah)"/>`
      + `<g class="sg ${sign === '+' ? 'p' : 'n'}"><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="22"/><text x="${sx.toFixed(1)}" y="${(sy + 9).toFixed(1)}">${sign === '+' ? '+' : '−'}</text></g></g>`;
  });
  nodes.forEach(([nid]) => {
    const n = N[nid], lines = n.label.split('|');
    out += `<g class="s node ${n.cls}" style="--i:0"><rect x="${n.x - n.w / 2}" y="${n.y - n.h / 2}" width="${n.w}" height="${n.h}" rx="16"/>`
      + lines.map((l, k) => `<text x="${n.x}" y="${n.y + 8 + (k - (lines.length - 1) / 2) * 28}">${esc(l)}</text>`).join('') + '</g>';
  });
  loops.forEach(([L, x, y]) => {
    out += `<g class="s loop ${L}" style="--i:${opts.seq ? links.length : 0}"><g class="spin"><circle cx="${x}" cy="${y}" r="34" stroke-dasharray="170 44"/></g><text x="${x}" y="${y + 14}">${L}</text></g>`;
  });
  svg.innerHTML = out;
}

/* === CARBON BATHTUB GAME === a teaching model, not a forecast. The atmosphere is one stock of
   CO2 (ppm; 1 ppm = 2.12 billion t C). Inflow: emissions, starting at 11 billion t C a year.
   Outflow: ocean and land take up 2.04% a year of the CO2 above the level they are in balance
   with (280 ppm before industry, about 6.2 billion t C a year today). That balance level creeps
   up toward the air's level over about 80 years, so the sinks slowly fill. Start: 422 ppm in 2025.
   Rough check against IPCC scenarios: steady emissions give ~580 ppm in 2100, net zero by 2050
   peaks near 435 ppm. */
const GTC = 2.12, PRE = 280, K = 0.0204, T = 80, E0 = 11, C0 = 422, Y0 = 2025, Y1 = 2100;
export const PATHS = {
  grow: { name: 'Keep growing', sub: 'up 1% a year', color: '#b3452c', e: y => E0 * 1.01 ** (y - Y0) },
  steady: { name: 'Hold steady', sub: 'same every year', color: '#c76f1e', e: () => E0 },
  nz2070: { name: 'Net zero by 2070', sub: 'cut a little each year', color: '#0d7397', e: y => Math.max(0, E0 * (1 - (y - Y0) / 45)) },
  nz2050: { name: 'Net zero by 2050', sub: 'cut fast', color: '#2e7d5b', e: y => Math.max(0, E0 * (1 - (y - Y0) / 25)) },
};
export function runPath(key) {
  const out = [];
  let c = C0, q = PRE;
  for (let y = Y0; y <= Y1; y++) {
    const e = PATHS[key].e(y), s = K * (c - q) * GTC;
    out.push({ y, e, s, c });
    c += (e - s) / GTC;
    q += (c - q) / T;
  }
  return out;
}
export function carbonTub() {
  const runs = {}, peaks = {};
  let pick = 'steady', anim = 0;
  const X = y => 90 + (y - Y0) / (Y1 - Y0) * 740, Y = c => 500 - (c - 250) / 500 * 460;
  $('#ct-paths').innerHTML = Object.entries(PATHS).map(([k, p]) => `<button type="button" data-p="${k}"${k === pick ? ' class="on"' : ''} style="--c:${p.color}"><b>${esc(p.name)}</b>${esc(p.sub)}</button>`).join('');
  function chart(partial) {
    let g = '';
    for (let c = 250; c <= 750; c += 50) g += `<line x1="90" y1="${Y(c)}" x2="830" y2="${Y(c)}" stroke="#ece5d6"/><text x="80" y="${Y(c) + 6}" text-anchor="end">${c}</text>`;
    for (let y = 2030; y <= 2100; y += 10) g += `<text x="${X(y)}" y="532" text-anchor="middle">${y}</text>`;
    g += `<line x1="90" y1="${Y(PRE)}" x2="830" y2="${Y(PRE)}" stroke="#75a29f" stroke-width="3" stroke-dasharray="10 8"/><text x="100" y="${Y(PRE) - 10}" style="fill:#2e7d5b">Before industry: 280 ppm</text>`;
    g += `<text x="14" y="24">CO₂ in the air (ppm)</text>`;
    const line = (pts, color, w = 5) => `<polyline points="${pts.map(p => `${X(p.y).toFixed(1)},${Y(p.c).toFixed(1)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
    Object.entries(runs).forEach(([k]) => { if (!partial || k !== pick) { const pts = runPath(k); g += line(pts, PATHS[k].color); const L = pts[pts.length - 1]; g += `<text x="${X(Y1) + 6}" y="${Y(L.c) + 6}" style="fill:${PATHS[k].color};font-weight:700">${Math.round(L.c)}</text>`; } });
    if (partial) g += line(partial, PATHS[pick].color, 7);
    $('#ct-chart').innerHTML = g;
  }
  function show(p) {
    $('#ct-year').textContent = p.y; $('#ct-e').textContent = p.e.toFixed(1); $('#ct-s').textContent = p.s.toFixed(1); $('#ct-c').textContent = Math.round(p.c);
  }
  function msg(text, kind = '') { const m = $('#ct-msg'); m.innerHTML = text; m.className = `tubmsg ${kind}`; }
  function done(pts) {
    const end = Math.round(pts[pts.length - 1].c), peak = pts.reduce((a, p) => p.c > a.c ? p : a);
    runs[pick] = end; peaks[pick] = Math.round(peak.c);
    const pr = $('#ct-predict').value;
    if (pick === 'steady') msg(`Steady emissions still pushed CO₂ up to <b>${end} ppm</b>. Every year more goes in than the ocean and land take out, so the stock keeps filling.${pr && pr !== 'rise' ? ' Not what you predicted!' : pr ? ' Just as you predicted.' : ''}`, pr === 'rise' ? 'win' : '');
    else if (pick === 'grow') msg(`Growing emissions reach <b>${end} ppm</b> by 2100, and still climbing.`, 'lose');
    else msg(`CO₂ peaked at <b>${Math.round(peak.c)} ppm</b> in ${peak.y}, the year emissions fell below what ocean and land absorb. By 2100 it is down to <b>${end} ppm</b>.`, 'win');
    chart();
  }
  function run() {
    cancelAnimationFrame(anim);
    const pts = runPath(pick), t0 = performance.now(), dur = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 5000;
    msg('Watch the readout: CO₂ rises whenever emitted is bigger than absorbed.');
    const step = now => {
      const n = Math.max(1, Math.min(pts.length, 1 + Math.floor((now - t0) / dur * pts.length)));
      show(pts[n - 1]); chart(pts.slice(0, n));
      if (n < pts.length) anim = requestAnimationFrame(step); else done(pts);
    };
    anim = requestAnimationFrame(step);
  }
  $('#ct-paths').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    pick = b.dataset.p; $$('#ct-paths button').forEach(x => x.classList.toggle('on', x === b));
    cancelAnimationFrame(anim); show(runPath(pick)[0]); chart();
  });
  $('#ct-run').addEventListener('click', run);
  show(runPath(pick)[0]); chart();
  return { result: () => ({ predict: $('#ct-predict').value, runs: { ...runs }, peaks: { ...peaks } }) };
}

/* === BEACH EXERCISE === six answers about one beach in the NOAA Sea Level Rise Viewer */
export const BEACH_Q = [['beach', '#bq-beach', 80], ['colors', '#bq-colors', 400], ['change', '#bq-change', 400], ['first', '#bq-first', 20], ['strategy', '#bq-strategy', 20], ['why', '#bq-why', 400]];
export function beachForm() {
  return {
    read() {
      const data = {};
      let missing = 0;
      BEACH_Q.forEach(([k, sel, max], i) => { data[k] = $(sel).value.trim().slice(0, max); if (!data[k] && !missing) missing = i + 1; });
      return { data, missing };
    },
  };
}

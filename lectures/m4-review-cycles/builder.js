/* ===========================================
   CYCLE SYSTEMS BUILDER (Review Exercise 2)
   Students draw one biogeochemical cycle: stocks (boxes), flows (labeled
   arrows), human impact cards and "outside the system" clouds, then add a
   title, a synthesis statement and their team.
   - Drafts autosave to this browser (localStorage) every 2 minutes and when
     the page is closed. Nothing is uploaded; students submit on Canvas.
   - Save file / Open file move a draft between computers (.cycle.json).
   - Print / Save as PDF prints one landscape page: Title, Diagram, Summary.
   =========================================== */
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const KEY = 'sos110-m4-review2-draft';
const AUTOSAVE_MS = 2 * 60 * 1000;
const W = 1160, H = 880;          // canvas size in SVG units

export const TEAMS = [
  ['1', 'Nitrogen'], ['2', 'Phosphorus'], ['3', 'Carbon'], ['4', 'Water'], ['5', 'Oxygen'], ['6', 'Sulfur'],
];
export const ECOSYSTEMS = ['Sonoran Desert (Phoenix area)', 'Tropical forest', 'Temperate forest', 'Savanna', 'Temperate grassland', 'Coastal wetland'];

/* The pick list on the left of the canvas, and name suggestions while typing:
   common stocks, processes (flows) and human impacts for each cycle.
   A human impact is [the touchpoint card, the human-caused flow it adds]. */
const PALETTE = {
  Nitrogen: {
    stocks: ['Atmosphere (N₂ gas)', 'Biological soil crust', 'Soil microbes', 'Soil organic matter', 'Soil ammonium (NH₄⁺)', 'Soil nitrate (NO₃⁻)', 'Plants', 'Animals', 'Groundwater', 'Canals and streams'],
    flows: ['Nitrogen fixation', 'Lightning fixation', 'Ammonification (decomposition)', 'Nitrification', 'Denitrification', 'Plant uptake', 'Eating (consumption)', 'Leaching', 'Atmospheric deposition'],
    human: [['Fertilized lawns and farms', 'Fertilizer runoff'], ['Cars and power plants', 'NOx emissions'], ['Off-road vehicles', 'Soil crust damage']],
  },
  Phosphorus: {
    stocks: ['Rocks and minerals (apatite)', 'Soil phosphate', 'Plants', 'Animals', 'Soil organic matter', 'Lakes and reservoirs', 'Sediments', 'Ocean'],
    flows: ['Weathering', 'Plant uptake', 'Eating (consumption)', 'Decomposition', 'Erosion', 'Runoff', 'Dust deposition', 'Sedimentation', 'Geologic uplift'],
    human: [['Phosphate mines', 'Mined phosphate rock'], ['Farms and lawns', 'Fertilizer runoff'], ['Wastewater treatment plants', 'Wastewater discharge'], ['Construction sites', 'Soil erosion']],
  },
  Carbon: {
    stocks: ['Atmosphere (CO₂)', 'Plants (biomass)', 'Animals', 'Soil organic carbon', 'Caliche and limestone', 'Fossil fuels', 'Ocean', 'Urban concrete and asphalt'],
    flows: ['Photosynthesis', 'Respiration', 'Eating (consumption)', 'Decomposition', 'Wildfire', 'Ocean absorption', 'Burial'],
    human: [['Cars and trucks', 'Vehicle emissions'], ['Power plants', 'Fossil fuel combustion'], ['New neighborhoods', 'Land clearing'], ['Cement plants', 'Cement production CO₂']],
  },
  Water: {
    stocks: ['Atmosphere (water vapor)', 'Clouds', 'Snowpack', 'Rivers and canals', 'Lakes and reservoirs', 'Soil moisture', 'Groundwater (aquifer)', 'Plants', 'Ocean'],
    flows: ['Evaporation', 'Transpiration', 'Condensation', 'Precipitation', 'Snowmelt', 'Infiltration', 'Runoff', 'Groundwater recharge'],
    human: [['Wells', 'Groundwater pumping'], ['Canals', 'Canal diversion'], ['Farms', 'Irrigation'], ['Pavement and roofs', 'Urban runoff']],
  },
  Oxygen: {
    stocks: ['Atmosphere (O₂)', 'Ozone layer (O₃)', 'Plants', 'Animals', 'Soil', 'Ocean (dissolved O₂)', 'Lakes and canals', 'Rocks (oxides)'],
    flows: ['Photosynthesis', 'Respiration', 'Decomposition', 'Weathering (oxidation)', 'Ozone formation', 'Dissolving into water'],
    human: [['Cars and power plants', 'Combustion uses O₂'], ['Traffic on hot days', 'Ground-level ozone smog'], ['Land clearing', 'Deforestation'], ['Fertilizer runoff', 'Algal bloom dead zones']],
  },
  Sulfur: {
    stocks: ['Atmosphere (SO₂, sulfate)', 'Vegetation', 'Soil organic matter', 'Soil sulfate (SO₄²⁻)', 'Rocks and minerals (gypsum, pyrite)', 'Streams and lakes', 'Ocean'],
    flows: ['Volcanic emissions', 'Acid rain (deposition)', 'Root uptake', 'Litter fall', 'Decomposition', 'Weathering', 'Leaching', 'DMS release from ocean'],
    human: [['Coal power plants', 'SO₂ emissions'], ['Mining and smelting', 'Acid mine drainage'], ['Logging', 'Timber harvest']],
  },
};
const SUGGEST = Object.fromEntries(Object.entries(PALETTE).map(([k, p]) => [k, [...p.stocks, ...p.flows, ...p.human.flat()]]));

/* === WORKED EXAMPLE === Team 6, the sulfur cycle in a temperate forest */
export const EXAMPLE = {
  v: 1, team: '6', cycle: 'Sulfur', ecosystem: 'Temperate forest', ecoOther: '',
  title: 'The Sulfur Cycle in a Temperate Forest',
  members: 'Team 6 (worked example)',
  summary: 'In a temperate forest, most sulfur cycles slowly between the soil, the trees and their fallen leaves, while rock weathering adds a small, steady supply. Burning coal sends extra SO₂ into the air, which falls back as acid rain: it adds sulfate faster than trees can use it and washes calcium and other nutrients out of the soil and into streams. Mining and logging speed up the outflows, so the forest can lose nutrients faster than weathering replaces them.',
  nodes: [
    { id: 'n1', kind: 'stock', x: 560, y: 90, label: 'Atmosphere (SO₂, sulfate)' },
    { id: 'n2', kind: 'stock', x: 250, y: 330, label: 'Vegetation (trees and plants)' },
    { id: 'n3', kind: 'stock', x: 250, y: 575, label: 'Soil organic matter and microbes' },
    { id: 'n4', kind: 'stock', x: 590, y: 430, label: 'Soil sulfate (SO₄²⁻)' },
    { id: 'n5', kind: 'stock', x: 600, y: 610, label: 'Rocks (gypsum, pyrite)' },
    { id: 'n6', kind: 'stock', x: 960, y: 440, label: 'Streams and lakes' },
    { id: 'c1', kind: 'cloud', x: 200, y: 70, label: 'Volcanoes' },
    { id: 'c2', kind: 'cloud', x: 1030, y: 615, label: 'Ocean (downstream)' },
    { id: 'c3', kind: 'cloud', x: 110, y: 190, label: 'Timber hauled away' },
    { id: 'h1', kind: 'human', x: 950, y: 80, label: 'Coal power plants' },
    { id: 'h2', kind: 'human', x: 960, y: 250, label: 'Mining and smelting' },
  ],
  flows: [
    { id: 'f1', from: 'c1', to: 'n1', label: 'Volcanic gases', human: false, note: '' },
    { id: 'f2', from: 'n1', to: 'n4', label: 'Acid rain and dry deposition', human: false, note: '' },
    { id: 'f3', from: 'n4', to: 'n2', label: 'Root uptake', human: false, note: '' },
    { id: 'f4', from: 'n2', to: 'n3', label: 'Leaf litter fall', human: false, note: '' },
    { id: 'f5', from: 'n3', to: 'n4', label: 'Decomposition', human: false, note: '' },
    { id: 'f6', from: 'n5', to: 'n4', label: 'Weathering', human: false, note: '' },
    { id: 'f7', from: 'n4', to: 'n6', label: 'Leaching and runoff', human: false, note: '' },
    { id: 'f8', from: 'n6', to: 'c2', label: 'River flow', human: false, note: '' },
    { id: 'f9', from: 'h1', to: 'n1', label: 'SO₂ emissions', human: true, note: 'Adds far more SO₂ to the air than volcanoes do here, so acid rain strips nutrients from forest soils and acidifies lakes.' },
    { id: 'f10', from: 'h2', to: 'n6', label: 'Acid mine drainage', human: true, note: 'Exposed pyrite turns into sulfuric acid that drains into streams, harming fish and insects.' },
    { id: 'f11', from: 'n2', to: 'c3', label: 'Timber harvest', human: true, note: 'Logs carry sulfur and other nutrients out of the forest, so less returns to the soil as fallen leaves.' },
  ],
};

const blank = () => ({ v: 1, team: '', cycle: '', ecosystem: '', ecoOther: '', title: '', members: '', summary: '', nodes: [], flows: [] });

/* === GEOMETRY === */
function wrap(text, max = 18) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines.slice(0, 4) : [''];
}
function box(n) {
  const lines = wrap(n.label, n.kind === 'human' ? 16 : 18);
  const long = Math.max(...lines.map(l => l.length), 6);
  const pad = n.kind === 'human' ? 70 : 40;
  const w = Math.max(n.kind === 'cloud' ? 170 : 150, long * 10.6 + pad);
  const h = lines.length * 24 + (n.kind === 'cloud' ? 40 : 30);
  return { lines, w, h, x: n.x - w / 2, y: n.y - h / 2 };
}
/* point where a ray from the node centre toward (tx,ty) leaves its box */
function edgePoint(n, b, tx, ty) {
  const dx = tx - n.x, dy = ty - n.y;
  if (!dx && !dy) return { x: n.x, y: n.y };
  const sx = (b.w / 2 + 4) / Math.abs(dx || 1e-9), sy = (b.h / 2 + 4) / Math.abs(dy || 1e-9);
  const s = Math.min(sx, sy);
  return { x: n.x + dx * s, y: n.y + dy * s };
}
function flowPath(a, b, ba, bb) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const bend = 36;                      // every flow bends to its left, so A→B and B→A never overlap
  const c = { x: mx - (dy / len) * bend, y: my + (dx / len) * bend };
  const s = edgePoint(a, ba, c.x, c.y), e = edgePoint(b, bb, c.x, c.y);
  const lx = 0.25 * s.x + 0.5 * c.x + 0.25 * e.x, ly = 0.25 * s.y + 0.5 * c.y + 0.25 * e.y;
  return { d: `M${s.x.toFixed(1)},${s.y.toFixed(1)} Q${c.x.toFixed(1)},${c.y.toFixed(1)} ${e.x.toFixed(1)},${e.y.toFixed(1)}`, lx, ly };
}

const FACTORY = '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1M12 18h1M7 18h1"/>';

/* === RENDER === draws a state into an <svg>; also used by the worked example and the print page */
export function render(svg, st, { sel = null, pending = null, viewBox = null } = {}) {
  const byId = Object.fromEntries(st.nodes.map(n => [n.id, n]));
  const boxes = Object.fromEntries(st.nodes.map(n => [n.id, box(n)]));
  let out = `<defs>
    <marker id="${svg.id}-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#0d7397"/></marker>
    <marker id="${svg.id}-ahh" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#b3452c"/></marker>
  </defs>`;
  /* arrows first, then the pieces, then the flow names on top so nothing hides them */
  let labels = '';
  for (const f of st.flows) {
    const a = byId[f.from], b = byId[f.to];
    if (!a || !b) continue;
    const p = flowPath(a, b, boxes[a.id], boxes[b.id]);
    const lab = f.label || 'Name this flow';
    const lw = lab.length * 8.2 + 22 + (f.human ? 20 : 0);
    const cls = `cy-flow${f.human ? ' human' : ''}${sel === f.id ? ' sel' : ''}`;
    out += `<g class="${cls}" data-id="${esc(f.id)}"><path class="hit" d="${p.d}"/><path class="line" d="${p.d}" marker-end="url(#${svg.id}-${f.human ? 'ahh' : 'ah'})"/></g>`;
    labels += `<g class="${cls}" data-id="${esc(f.id)}">
      <rect class="lab-bg" x="${(p.lx - lw / 2).toFixed(1)}" y="${(p.ly - 15).toFixed(1)}" width="${lw.toFixed(1)}" height="30" rx="15"/>
      <text class="lab${f.label ? '' : ' empty'}" x="${(p.lx + (f.human ? 10 : 0)).toFixed(1)}" y="${(p.ly + 5.5).toFixed(1)}">${esc(lab)}</text>
      ${f.human ? `<text class="lab-ico" x="${(p.lx - lw / 2 + 15).toFixed(1)}" y="${(p.ly + 6).toFixed(1)}">!</text>` : ''}
    </g>`;
  }
  for (const n of st.nodes) {
    const b = boxes[n.id];
    const ty = n.y - (b.lines.length - 1) * 12 + 7;
    const tx = n.kind === 'human' ? n.x + 18 : n.x;
    let shape;
    if (n.kind === 'cloud') shape = `<rect class="shape" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.h / 2}"/>`;
    else shape = `<rect class="shape" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${n.kind === 'human' ? 14 : 8}"/>`;
    const ico = n.kind === 'human' ? `<g class="fic" transform="translate(${b.x + 12},${n.y - 14}) scale(1.15)">${FACTORY}</g>` : '';
    const tag = n.kind === 'cloud' ? `<text class="tag" x="${n.x}" y="${b.y + b.h - 9}">outside the system</text>` : '';
    out += `<g class="cy-node ${n.kind}${sel === n.id ? ' sel' : ''}${pending === n.id ? ' pending' : ''}" data-id="${esc(n.id)}">${shape}${ico}
      <text class="nm" x="${tx}" y="${n.kind === 'cloud' ? ty - 8 : ty}">${b.lines.map((l, i) => `<tspan x="${tx}" dy="${i ? 24 : 0}">${esc(l)}</tspan>`).join('')}</text>${tag}</g>`;
  }
  out += labels;
  if (viewBox === 'fit' && st.nodes.length) {
    const xs = st.nodes.flatMap(n => [boxes[n.id].x, boxes[n.id].x + boxes[n.id].w]);
    const ys = st.nodes.flatMap(n => [boxes[n.id].y, boxes[n.id].y + boxes[n.id].h]);
    const x0 = Math.min(...xs) - 50, y0 = Math.min(...ys) - 50;
    svg.setAttribute('viewBox', `${x0} ${y0} ${Math.max(...xs) - x0 + 50} ${Math.max(...ys) - y0 + 50}`);
  } else svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = out;
}

export const ecoName = st => st.ecosystem === 'other' ? (st.ecoOther || 'another ecosystem') : st.ecosystem;
export const humanFlows = st => st.flows.filter(f => f.human);

/* === CHECKS === the "before you upload" list, worked out live */
export function checks(st) {
  const stocks = st.nodes.filter(n => n.kind === 'stock');
  const named = stocks.filter(n => n.label && n.label !== 'New stock');
  const unnamedFlows = st.flows.filter(f => !f.label).length;
  const hum = humanFlows(st).length;
  const t = (st.title || '').toLowerCase();
  const eco = ecoName(st).toLowerCase().split(/[\s(]/)[0];
  return [
    ['Title names your cycle and your ecosystem', !!(st.cycle && t.includes(st.cycle.toLowerCase()) && eco && t.includes(eco))],
    [`At least 3 stocks, each named (${named.length} so far)`, named.length >= 3 && named.length === stocks.length],
    [`Every flow is an arrow with a name (${st.flows.length} flows${unnamedFlows ? `, ${unnamedFlows} unnamed` : ''})`, st.flows.length >= 3 && !unnamedFlows],
    [`2 or 3 human impacts, each explained (${hum} so far)`, hum >= 2 && hum <= 3 && humanFlows(st).every(f => (f.note || '').trim().length > 10)],
    ['Synthesis statement written (2–4 sentences)', (st.summary || '').trim().length >= 120],
    ['Full names of every team member', (st.members || '').trim().length >= 3],
  ];
}

/* === PRINT PAGE === one landscape page: title band, diagram, summary band */
export function printSheet(sheet, st) {
  const hum = humanFlows(st);
  const meta = [st.team && `Team ${st.team}`, st.cycle && `${st.cycle} cycle`, ecoName(st)].filter(Boolean).join(' · ');
  sheet.innerHTML = `
    <header class="ps-title"><h1>${esc(st.title || 'Untitled cycle')}</h1><p>${esc(meta)}</p></header>
    <section class="ps-diagram"><svg id="ps-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"></svg>
      <p class="ps-legend"><span class="lg stock">Stock (pool)</span><span class="lg flow">Flow (process)</span><span class="lg hflow">Human-caused flow</span><span class="lg human">Human touchpoint</span><span class="lg cloud">Outside the system</span></p></section>
    <footer class="ps-summary">
      <div><h2>Summary</h2><p>${esc(st.summary || '')}</p></div>
      <div><h2>Human impacts</h2><ol>${hum.map(f => `<li><b>${esc(f.label)}:</b> ${esc(f.note || '')}</li>`).join('') || '<li>None marked yet.</li>'}</ol>
      <h2>Team members</h2><p>${esc(st.members || '')}</p></div>
    </footer>`;
  render($('#ps-svg', sheet), st, { viewBox: 'fit' });
}

/* === BUILDER === wires the editor inside root; returns { load } */
export function initBuilder(root, { onChange } = {}) {
  const svg = $('#cy-svg', root);
  const ui = id => $(`[data-cy="${id}"]`, root);
  let st = blank(), sel = null, mode = 'move', pending = null, preset = null, drag = null, dirty = false, seq = 1;
  const undo = [];

  const snap = () => { undo.push(JSON.stringify(st)); if (undo.length > 60) undo.shift(); };
  const nid = p => { let id; do id = `${p}${seq++}`; while (st.nodes.some(n => n.id === id) || st.flows.some(f => f.id === id)); return id; };
  const find = id => st.nodes.find(n => n.id === id) || st.flows.find(f => f.id === id);

  function changed() { dirty = true; draw(); }
  function draw() {
    render(svg, st, { sel, pending });
    ui('empty').hidden = st.nodes.length > 0;
    drawPanel();
    drawPalette();
    drawChecks();
    onChange?.(st);
  }
  function drawChecks() {
    const list = checks(st);
    ui('checks').innerHTML = list.map(([t, ok]) => `<li class="${ok ? 'ok' : ''}"><i></i>${esc(t)}</li>`).join('');
    ui('score').textContent = `${list.filter(c => c[1]).length} of ${list.length}`;
  }

  /* --- fields --- */
  const fields = ['team', 'cycle', 'ecosystem', 'ecoOther', 'title', 'members', 'summary'];
  function fillFields() {
    fields.forEach(f => { ui(f).value = st[f] || ''; });
    ui('ecoOther').hidden = st.ecosystem !== 'other';
    suggest();
  }
  function suggest() {
    const list = SUGGEST[st.cycle] || Object.values(SUGGEST).flat();
    ui('names').innerHTML = [...new Set(list)].map(s => `<option value="${esc(s)}">`).join('');
    const eco = st.ecosystem === 'other' ? st.ecoOther : (st.ecosystem || '').replace(/ \(.*\)$/, '');
    const sug = st.cycle && eco ? `The ${st.cycle} Cycle in the ${eco}` : 'Example: The Nitrogen Cycle in the Sonoran Desert';
    ui('title').placeholder = sug;
    ui('use-title').hidden = !(st.cycle && eco) || st.title === sug;
    ui('use-title').dataset.title = sug;
  }
  fields.forEach(f => ui(f).addEventListener('input', () => {
    st[f] = ui(f).value;
    if (f === 'team' && st.team) { st.cycle = TEAMS.find(t => t[0] === st.team)[1]; ui('cycle').value = st.cycle; }
    if (f === 'ecosystem') ui('ecoOther').hidden = st.ecosystem !== 'other';
    suggest();
    if (f === 'team' || f === 'cycle') drawPalette();
    dirty = true; drawChecks(); onChange?.(st);
  }));
  ui('use-title').addEventListener('click', () => { st.title = ui('use-title').dataset.title; ui('title').value = st.title; suggest(); changed(); });

  /* --- pick list: stocks, processes and human impacts for the chosen cycle --- */
  function drawPalette() {
    const p = PALETTE[st.cycle];
    if (!p) { ui('palette').innerHTML = '<p class="cy-pal-empty">Pick your team or cycle above to see its stocks, processes and human impacts.</p>'; return; }
    const used = new Set(st.nodes.map(n => n.label));
    const usedF = new Set(st.flows.map(f => f.label));
    ui('palette').innerHTML = `
      <h5><span class="sw"></span>Stocks <small>click to add</small></h5>
      <div class="cy-pal-list">${p.stocks.map(x => `<button type="button" class="pi stock${used.has(x) ? ' used' : ''}" data-add="stock" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>
      <h5><span class="sw f"></span>Processes / flows <small>click, then FROM → TO</small></h5>
      <div class="cy-pal-list">${p.flows.map(x => `<button type="button" class="pi flow${usedF.has(x) ? ' used' : ''}" data-add="flow" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>
      <h5><span class="sw h"></span>Human impacts <small>click, then the stock it changes</small></h5>
      <div class="cy-pal-list">${p.human.map(([c, f]) => `<button type="button" class="pi human${used.has(c) ? ' used' : ''}" data-add="human" data-v="${esc(c)}" data-f="${esc(f)}"><b>${esc(c)}</b><span>${esc(f)}</span></button>`).join('')}</div>`;
  }
  /* an open spot on the canvas for a new piece */
  function freeSpot() {
    for (let y = 90; y <= H - 80; y += 165) for (let x = 140; x <= W - 140; x += 293) {
      const sx = x + (((y - 90) / 165) % 2 ? 146 : 0);
      if (sx > W - 120) continue;
      if (st.nodes.every(n => Math.abs(n.x - sx) > 250 || Math.abs(n.y - y) > 130)) return { x: sx, y };
    }
    return { x: W / 2 + (Math.random() - .5) * 200, y: H / 2 + (Math.random() - .5) * 200 };
  }
  ui('palette').addEventListener('click', e => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    const v = b.dataset.v;
    if (b.dataset.add === 'flow') {
      setMode('flow'); preset = { label: v, human: false };
      ui('tip').textContent = `"${v}": click the piece it flows FROM, then the piece it flows TO.`;
      return;
    }
    snap();
    const kind = b.dataset.add, at = freeSpot();
    const n = { id: nid('n'), kind, x: Math.round(at.x), y: Math.round(at.y), label: v };
    st.nodes.push(n);
    if (kind === 'human') {
      setMode('flow'); pending = n.id; preset = { label: b.dataset.f, human: true };
      ui('tip').textContent = `"${b.dataset.f}": now click the stock this human impact changes.`;
      changed();
    } else { sel = n.id; setMode('move'); changed(); }
  });

  /* --- selected piece --- */
  function drawPanel() {
    const it = sel && find(sel);
    ui('panel').hidden = !it;
    ui('hint').hidden = !!it;
    if (!it) return;
    const isFlow = 'from' in it;
    ui('ptype').textContent = isFlow ? (it.human ? 'Human-caused flow' : 'Flow (process)') : ({ stock: 'Stock (pool)', human: 'Human touchpoint', cloud: 'Outside the system' }[it.kind]);
    if (document.activeElement !== ui('pname')) ui('pname').value = it.label || '';
    ui('pname').placeholder = isFlow ? 'Name the process, e.g. Decomposition' : 'Name the pool, e.g. Soil organic matter';
    ui('phuman-row').hidden = !isFlow;
    ui('phuman').checked = !!it.human;
    ui('pnote-row').hidden = !(isFlow && it.human);
    if (document.activeElement !== ui('pnote')) ui('pnote').value = it.note || '';
  }
  let typing = null;
  ui('pname').addEventListener('focus', () => { typing = null; });
  ui('pname').addEventListener('input', () => { const it = find(sel); if (!it) return; if (typing !== sel) { snap(); typing = sel; } it.label = ui('pname').value.slice(0, 60); changed(); });
  ui('pnote').addEventListener('input', () => { const it = find(sel); if (!it) return; it.note = ui('pnote').value.slice(0, 300); changed(); });
  ui('phuman').addEventListener('change', () => { const it = find(sel); if (!it) return; snap(); it.human = ui('phuman').checked; changed(); });
  ui('pdelete').addEventListener('click', () => remove(sel));
  ui('pdone').addEventListener('click', () => { sel = null; draw(); });

  function remove(id) {
    if (!id) return;
    snap();
    st.nodes = st.nodes.filter(n => n.id !== id);
    st.flows = st.flows.filter(f => f.id !== id && f.from !== id && f.to !== id);
    sel = null; changed();
  }

  /* --- tools --- */
  const TIPS = {
    move: 'Drag pieces to move them. Click one to name or delete it.',
    stock: 'Click the canvas to add a stock (a pool where the element is stored).',
    human: 'Click the canvas to add a human touchpoint (a city, farm, factory or car).',
    cloud: 'Click the canvas to add a cloud: where matter enters or leaves your system.',
    flow: 'Click the piece the element flows FROM, then the piece it flows TO.',
  };
  function setMode(m) {
    mode = m; pending = null; preset = null;
    $$('[data-tool]', root).forEach(b => b.classList.toggle('on', b.dataset.tool === m));
    ui('tip').textContent = TIPS[m];
    svg.dataset.mode = m;
    draw();
  }
  $$('[data-tool]', root).forEach(b => b.addEventListener('click', () => setMode(b.dataset.tool)));
  ui('undo').addEventListener('click', () => { if (!undo.length) return; st = JSON.parse(undo.pop()); sel = null; fillFields(); changed(); });

  /* two-click confirm, so no browser dialog interrupts the deck */
  function twoStep(btn, label, act) {
    let armed = null;
    btn.addEventListener('click', () => {
      if (armed) { clearTimeout(armed); armed = null; btn.textContent = label; btn.classList.remove('armed'); act(); return; }
      if (!st.nodes.length && !st.title) { act(); return; }
      btn.textContent = 'Replace your work? Click again'; btn.classList.add('armed');
      armed = setTimeout(() => { armed = null; btn.textContent = label; btn.classList.remove('armed'); }, 4000);
    });
  }
  twoStep(ui('example'), ui('example').textContent, () => load(EXAMPLE, true));
  twoStep(ui('clear'), ui('clear').textContent, () => load(blank(), true));

  /* --- pointer on canvas --- */
  function pt(e) {
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(svg.getScreenCTM().inverse());
    return { x: Math.max(60, Math.min(W - 60, q.x)), y: Math.max(36, Math.min(H - 36, q.y)) };
  }
  svg.addEventListener('pointerdown', e => {
    const g = e.target.closest('[data-id]');
    const id = g?.dataset.id;
    const p = pt(e);
    if (['stock', 'human', 'cloud'].includes(mode)) {
      snap();
      const kind = mode;
      const n = { id: nid('n'), kind, x: Math.round(p.x), y: Math.round(p.y), label: '' };
      st.nodes.push(n); sel = n.id; setMode('move'); changed();
      setTimeout(() => ui('pname').focus(), 0);
      return;
    }
    if (mode === 'flow') {
      if (!id || !g.classList.contains('cy-node')) return;
      if (!pending) { pending = id; ui('tip').textContent = 'Now click the piece it flows TO.'; draw(); return; }
      if (pending === id) { pending = null; draw(); return; }
      snap();
      const from = st.nodes.find(n => n.id === pending), to = st.nodes.find(n => n.id === id);
      const f = { id: nid('f'), from: pending, to: id, label: preset?.label || '', human: !!preset?.human || from.kind === 'human' || to.kind === 'human', note: '' };
      st.flows.push(f); sel = f.id; setMode('move'); changed();
      setTimeout(() => ui(f.human && f.label ? 'pnote' : 'pname').focus(), 0);
      return;
    }
    /* move mode */
    if (!id) { sel = null; draw(); return; }
    sel = id;
    const n = st.nodes.find(x => x.id === id);
    if (n) { drag = { n, dx: n.x - p.x, dy: n.y - p.y, moved: false }; svg.setPointerCapture(e.pointerId); }
    draw();
  });
  svg.addEventListener('pointermove', e => {
    if (!drag) return;
    const p = pt(e);
    if (!drag.moved) { snap(); drag.moved = true; }
    drag.n.x = Math.round(p.x + drag.dx); drag.n.y = Math.round(p.y + drag.dy);
    dirty = true;
    render(svg, st, { sel, pending });
  });
  const end = () => { if (drag?.moved) changed(); drag = null; };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
  /* keep slide swipes and arrow keys away from the canvas */
  root.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
  document.addEventListener('keydown', e => {
    if (!root.closest('.slide')?.classList.contains('active')) return;
    if (e.target.closest('input, textarea, select')) return;
    if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); remove(sel); }
    if (e.key === 'Escape') { sel = null; setMode('move'); }
  });

  /* --- autosave: every 2 minutes, plus when the page is hidden or closed --- */
  const stamp = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  function saveDraft(why) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...st, saved: Date.now() }));
      dirty = false;
      ui('saved').textContent = `${why === 'auto' ? 'Autosaved' : 'Draft saved'} at ${stamp(new Date())}. It stays in this browser only.`;
      ui('saved').className = 'cy-saved ok';
    } catch (err) {
      ui('saved').textContent = 'This browser blocked saving. Use Save file to keep a copy.';
      ui('saved').className = 'cy-saved err';
    }
  }
  setInterval(() => { if (dirty) saveDraft('auto'); }, AUTOSAVE_MS);
  addEventListener('pagehide', () => { if (dirty) saveDraft('auto'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && dirty) saveDraft('auto'); });
  ui('save-now').addEventListener('click', () => saveDraft('now'));

  /* --- save / open a file --- */
  ui('save-file').addEventListener('click', () => {
    const name = (st.title || 'my-cycle').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-cycle';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ ...st, saved: Date.now() }, null, 1)], { type: 'application/json' }));
    a.download = `${name}.cycle.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  ui('open-file').addEventListener('click', () => ui('file').click());
  ui('file').addEventListener('change', async () => {
    const f = ui('file').files[0];
    ui('file').value = '';
    if (!f) return;
    try { load(clean(JSON.parse(await f.text())), true); ui('saved').textContent = `Opened ${f.name}.`; ui('saved').className = 'cy-saved ok'; }
    catch (err) { ui('saved').textContent = 'That file is not a saved cycle.'; ui('saved').className = 'cy-saved err'; }
  });

  /* only keep known fields from a file or draft; ids are letters, digits and dashes only */
  const safeId = v => String(v ?? '').replace(/[^\w-]/g, '').slice(0, 20) || 'x';
  function clean(d) {
    if (!d || !Array.isArray(d.nodes) || !Array.isArray(d.flows)) throw new Error('bad file');
    const s = blank();
    fields.forEach(f => { s[f] = String(d[f] ?? '').slice(0, 2000); });
    s.nodes = d.nodes.slice(0, 80).map(n => ({ id: safeId(n.id), kind: ['stock', 'human', 'cloud'].includes(n.kind) ? n.kind : 'stock', x: Math.max(60, Math.min(W - 60, Number(n.x) || 100)), y: Math.max(36, Math.min(H - 36, Number(n.y) || 100)), label: String(n.label ?? '').slice(0, 60) }));
    s.flows = d.flows.slice(0, 120).map(f => ({ id: safeId(f.id), from: safeId(f.from), to: safeId(f.to), label: String(f.label ?? '').slice(0, 60), human: !!f.human, note: String(f.note ?? '').slice(0, 300) }));
    return s;
  }

  function load(data, keep) {
    if (keep) snap();
    st = JSON.parse(JSON.stringify(data));
    sel = null; pending = null;
    fillFields(); setMode('move');
    dirty = true;
    if (keep) saveDraft('now');
  }

  /* --- print / save as PDF --- */
  ui('print').addEventListener('click', () => { document.body.classList.add('print-cycle'); printSheet($('#print-sheet'), st); print(); });
  addEventListener('beforeprint', () => { if (root.closest('.slide')?.classList.contains('active')) { document.body.classList.add('print-cycle'); printSheet($('#print-sheet'), st); } });
  addEventListener('afterprint', () => document.body.classList.remove('print-cycle'));

  /* --- start: restore the draft from this browser, if any --- */
  let restored = null;
  try { restored = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (err) { /* storage blocked */ }
  if (restored) {
    try { st = clean(restored); ui('saved').textContent = `Restored your draft from ${stamp(new Date(restored.saved || Date.now()))}.`; ui('saved').className = 'cy-saved ok'; }
    catch (err) { st = blank(); }
  }
  fillFields(); setMode('move');
  return { load: d => load(d, true), get state() { return st; } };
}

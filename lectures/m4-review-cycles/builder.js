/* ===========================================
   CYCLE SYSTEMS BUILDER (Review Exercise 2)
   Students draw one biogeochemical cycle with stock-and-flow marks: stocks
   (boxes), flows (pipes with a valve, named after the process), clouds
   (outside the system), + and − arrows (what speeds or slows something) and
   human touchpoint cards, then add a title, a synthesis statement and team.
   - Drafts autosave to this browser (localStorage) every 2 minutes and when
     the page is closed. Nothing is uploaded; students submit on Canvas.
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

/* === ICONS === simple line icons on a 24-unit box centred on 0,0, picked from a piece's name */
const ICON = {
  air: 'M-11 -5 h13 a3.5 3.5 0 1 0 -3.5 -3.5 M-11 1 h18 a3.5 3.5 0 1 1 -3.5 3.5 M-11 7 h8',
  cloud: 'M-8 7 h15 a5 5 0 0 0 0 -10 a7 7 0 0 0 -13 -1 a4.5 4.5 0 0 0 -2 11 z',
  rain: 'M-8 2 h15 a4.5 4.5 0 0 0 0 -9 a6.5 6.5 0 0 0 -12 -1 a4 4 0 0 0 -3 10 z M-5 6 l-1.5 4 M0 6 l-1.5 4 M5 6 l-1.5 4',
  vapor: 'M-6 10 q-3 -4 0 -8 q3 -4 0 -8 q-3 -4 0 -6 M1 10 q-3 -4 0 -8 q3 -4 0 -8 q-3 -4 0 -6 M8 10 q-3 -4 0 -8 q3 -4 0 -8',
  sun: 'M0 -5 a5 5 0 1 0 .1 0 M0 -11 v3 M0 8 v3 M-11 0 h3 M8 0 h3 M-7.8 -7.8 l2 2 M5.8 5.8 l2 2 M7.8 -7.8 l-2 2 M-5.8 5.8 l-2 2',
  drop: 'M0 -10 q8 9 8 13 a8 8 0 0 1 -16 0 q0 -4 8 -13 z',
  snow: 'M0 -10 v20 M-8.7 -5 l17.4 10 M-8.7 5 l17.4 -10 M-3 -8 l3 3 l3 -3 M-3 8 l3 -3 l3 3',
  leaf: 'M-9 9 q0 -17 18 -18 q1 18 -18 18 z M-9 9 l10 -10',
  tree: 'M0 11 v-6 M0 5 l-6 0 l6 -15 l6 15 z M-3 0 h6',
  root: 'M0 -2 v-6 M0 -8 q-6 -4 -8 1 q5 2 8 -1 M0 -8 q6 -4 8 1 q-5 2 -8 -1 M-11 -2 h22 M0 -2 v6 M0 4 l-5 6 M0 4 l5 6 M0 2 l-6 2',
  animal: 'M-9 1 q0 -6 8 -6 h4 l3 -4 l1 4 q4 1 4 6 q0 3 -3 3 h-15 q-2 0 -2 -3 z M-6 4 v6 M5 4 v6',
  microbe: 'M0 -7 a7 7 0 1 0 .1 0 M-2 -2 a1.2 1.2 0 1 0 .1 0 M3 1 a1.2 1.2 0 1 0 .1 0 M-1 3 a1 1 0 1 0 .1 0 M7 -5 l4 -4 M-7 5 l-4 4 M7 5 l4 2',
  soil: 'M-11 -2 h22 M-11 3 h22 M-11 8 h22 M0 -2 v-5 M0 -7 q-5 -3 -7 0 M0 -7 q5 -3 7 0',
  crust: 'M-11 -1 q2 -4 4 0 q2 -4 4 0 q2 -4 4 0 q2 -4 4 0 q2 -4 4 0 q2 -4 4 0 M-11 4 h22 M-11 9 h22 M-5 -6 v2 M3 -7 v3',
  rock: 'M-11 8 l3 -10 l7 -5 l8 2 l5 7 v6 z M-8 -2 l6 4 l7 -2',
  sediment: 'M-11 -3 h22 M-11 2 h22 M-11 7 h22 M-6 -7 a1 1 0 1 0 .1 0 M4 -8 a1 1 0 1 0 .1 0 M-1 -9 a1 1 0 1 0 .1 0',
  wave: 'M-11 -4 q3 -4 5.5 0 t5.5 0 t5.5 0 t5.5 0 M-11 2 q3 -4 5.5 0 t5.5 0 t5.5 0 t5.5 0 M-11 8 q3 -4 5.5 0 t5.5 0 t5.5 0 t5.5 0',
  river: 'M-11 -5 q5 -5 11 0 t11 0 M-11 5 q5 -5 11 0 t11 0',
  lake: 'M-11 4 q0 -6 11 -6 q11 0 11 6 q0 6 -11 6 q-11 0 -11 -6 z M-5 4 q2.5 -2 5 0 q2.5 2 5 0 M-8 -3 v-8 M-5 -3 v-6',
  aquifer: 'M-11 -8 h22 M-11 -3 h22 M-11 10 h22 M0 0 q5 5 5 7 a5 5 0 0 1 -10 0 q0 -2 5 -7 z',
  fire: 'M0 11 a7 7 0 0 1 -7 -7 q0 -6 5 -10 q0 5 3 6 q1 -4 -1 -9 q10 6 7 15 a7 7 0 0 1 -7 5 z',
  oil: 'M-7 -9 h14 v18 h-14 z M-7 -3 h14 M-7 3 h14',
  volcano: 'M-11 10 l7 -13 h8 l7 13 z M-4 -3 q4 3 8 0 M-2 -6 l-2 -5 M2 -6 l2 -5 M0 -6 v-5',
  bolt: 'M2 -11 l-8 12 h6 l-2 10 l8 -12 h-6 z',
  factory: 'M-11 10 v-10 l6 -4 v4 l6 -4 v4 l6 -4 v-6 h4 v20 z M-7 5 h2 M-1 5 h2 M5 5 h2',
  car: 'M-11 5 v-4 l3 -6 h14 l4 6 h1 v4 z M-6 5 a2.5 2.5 0 1 0 .1 0 M6 5 a2.5 2.5 0 1 0 .1 0',
  farm: 'M-11 10 l5 -8 M-4 10 l2 -8 M4 10 l-2 -8 M11 10 l-5 -8 M0 -2 v-6 M0 -8 q-5 -3 -7 0 q3 3 7 0 M0 -8 q5 -3 7 0 q-3 3 -7 0',
  mine: 'M-10 10 l12 -12 M-1 -11 q8 1 12 10 q-6 -6 -12 -5 z',
  house: 'M-10 0 l10 -9 l10 9 M-7 -2 v12 h14 v-12 M-2 10 v-6 h4 v6',
  city: 'M-11 10 v-12 h7 v12 M-4 10 v-18 h8 v18 M4 10 v-9 h7 v9 M-8 -6 v1 M0 -14 v1 M0 -9 v1',
  well: 'M-8 10 v-10 h16 v10 M-10 0 h20 M0 0 v-6 M-6 -6 h12 M-6 -10 l6 -2 l6 2 M0 3 v4',
  pipe: 'M-11 -6 h12 a5 5 0 0 1 5 5 v4 M-11 -1 h11 v4 M6 7 v2 M1 7 v2 M3.5 10 v2',
  axe: 'M-9 10 l12 -14 M1 -8 q6 -4 9 0 q-3 6 -7 6 z',
  dam: 'M-11 -6 q3 -3 5.5 0 t5.5 0 M-11 0 q3 -3 5.5 0 t5.5 0 M2 -9 l3 18 h6 v-18 z',
  ozone: 'M0 -10 a10 10 0 1 0 .1 0 M0 -5 a5 5 0 1 0 .1 0',
  dust: 'M-9 -4 a1.3 1.3 0 1 0 .1 0 M-3 -7 a1.3 1.3 0 1 0 .1 0 M4 -4 a1.3 1.3 0 1 0 .1 0 M9 -8 a1.3 1.3 0 1 0 .1 0 M-6 3 a1.3 1.3 0 1 0 .1 0 M2 2 a1.3 1.3 0 1 0 .1 0 M-11 9 q11 -5 22 0',
  person: 'M0 -9 a3.5 3.5 0 1 0 .1 0 M-7 10 q0 -11 7 -11 q7 0 7 11',
  dot: 'M0 -6 a6 6 0 1 0 .1 0',
};
/* first matching rule wins, so people's machines come before "plants" and "air" */
const ICON_RULES = [
  [/power plant|smelt|cement|factor|industr/i, 'factory'], [/\bcars?\b|truck|traffic|vehicle|off-road/i, 'car'],
  [/\bmines?\b|mining|mined/i, 'mine'], [/logging|timber|clearing|deforest/i, 'axe'], [/well|pumping/i, 'well'],
  [/wastewater|discharge|sewage/i, 'pipe'], [/diversion|\bdams?\b/i, 'dam'],
  [/farm|lawn|fertili|irrigat/i, 'farm'], [/neighborhood|construction|pavement|roof|urban|concrete|asphalt|city/i, 'city'],
  [/volcan/i, 'volcano'], [/lightning/i, 'bolt'], [/fire|combust|burn/i, 'fire'], [/fossil/i, 'oil'],
  [/ozone/i, 'ozone'], [/photosynth/i, 'sun'], [/evapor|transpir|vapou?r|dms/i, 'vapor'],
  [/dust/i, 'dust'], [/erosion/i, 'sediment'], [/precip|acid rain|deposition|\brain/i, 'rain'], [/condens|cloud/i, 'cloud'], [/snow/i, 'snow'],
  [/aquifer|groundwater|recharge/i, 'aquifer'], [/ocean|sea\b/i, 'wave'], [/lake|reservoir/i, 'lake'],
  [/river|stream|canal/i, 'river'], [/runoff|leach|infiltrat|moisture|dissolv|water|melt/i, 'drop'],
  [/crust/i, 'crust'], [/sediment|burial/i, 'sediment'],
  [/rock|mineral|weather|caliche|limestone|uplift|oxide|gypsum|apatite/i, 'rock'],
  [/microb|decompos|ammonif|nitrif|denitrif|fixation|bacteria/i, 'microbe'],
  [/uptake|root/i, 'root'], [/litter|leaf|leaves/i, 'leaf'], [/tree|forest|vegetation/i, 'tree'],
  [/plant|biomass/i, 'leaf'], [/animal|eating|consum/i, 'animal'], [/soil|organic/i, 'soil'],
  [/atmos|air|gas|emission|nox|so₂|co₂|respir|smog/i, 'air'],
];
export const iconFor = (label, kind) => {
  const r = ICON_RULES.find(([re]) => re.test(label || ''));
  return r ? r[1] : (kind === 'human' ? 'person' : 'dot');
};
export const iconPath = k => ICON[k] || ICON.dot;
/* a small inline icon for the pick list */
const picon = (label, kind) => `<svg class="pic" viewBox="-13 -13 26 26" aria-hidden="true"><path d="${iconPath(iconFor(label, kind))}"/></svg>`;


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
  links: [
    { id: 'l1', from: 'n1', to: 'f2', sign: '+' },
  ],
};

const blank = () => ({ v: 1, team: '', cycle: '', ecosystem: '', ecoOther: '', title: '', members: '', summary: '', nodes: [], flows: [], links: [] });

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
  const pad = n.kind === 'cloud' ? 70 : 74;
  const w = Math.max(n.kind === 'cloud' ? 190 : 160, long * 10.6 + pad);
  const h = Math.max(lines.length * 24 + (n.kind === 'cloud' ? 44 : 30), n.kind === 'cloud' ? 84 : 54);
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
  const tdx = e.x - c.x, tdy = e.y - c.y, tl = Math.hypot(tdx, tdy) || 1;
  const ux = tdx / tl, uy = tdy / tl;                     // direction at the arrow head
  const ex = e.x - ux * 14, ey = e.y - uy * 14;           // the pipe stops where the head starts
  const f = n => n.toFixed(1);
  return {
    d: `M${f(s.x)},${f(s.y)} Q${f(c.x)},${f(c.y)} ${f(e.x)},${f(e.y)}`,
    pipe: `M${f(s.x)},${f(s.y)} Q${f(c.x)},${f(c.y)} ${f(ex)},${f(ey)}`,
    head: `M${f(e.x)},${f(e.y)} L${f(ex - uy * 9)},${f(ey + ux * 9)} L${f(ex + uy * 9)},${f(ey - ux * 9)} Z`,
    lx, ly, ang: Math.atan2(e.y - s.y, e.x - s.x) * 180 / Math.PI,
  };
}
/* a + or − arrow: a thin curve from a piece (or a valve) to a piece (or a valve) */
function linkPath(a, b, ba, bb) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const c = { x: mx + (dy / len) * 44, y: my - (dx / len) * 44 };
  const end = (n, bx) => bx ? edgePoint(n, bx, c.x, c.y) : (() => { const vx = c.x - n.x, vy = c.y - n.y, l = Math.hypot(vx, vy) || 1; return { x: n.x + vx / l * 22, y: n.y + vy / l * 22 }; })();
  const s = end(a, ba), e = end(b, bb);
  const tdx = e.x - c.x, tdy = e.y - c.y, tl = Math.hypot(tdx, tdy) || 1, ux = tdx / tl, uy = tdy / tl;
  const ex = e.x - ux * 11, ey = e.y - uy * 11, f = n => n.toFixed(1);
  return {
    d: `M${f(s.x)},${f(s.y)} Q${f(c.x)},${f(c.y)} ${f(ex)},${f(ey)}`,
    head: `M${f(e.x)},${f(e.y)} L${f(ex - uy * 6.5)},${f(ey + ux * 6.5)} L${f(ex + uy * 6.5)},${f(ey - ux * 6.5)} Z`,
    sx: 0.25 * s.x + 0.5 * c.x + 0.25 * ex, sy: 0.25 * s.y + 0.5 * c.y + 0.25 * ey,
  };
}
/* a cloud outline that fills a w×h box centred on 0,0 */
function cloudPath(w, h) {
  const x = w / 2, y = h / 2, f = n => n.toFixed(1);
  return `M${f(-x * .78)},${f(y)} H${f(x * .78)} C${f(x * 1.05)},${f(y)} ${f(x * 1.08)},${f(y * .1)} ${f(x * .82)},${f(-y * .1)} `
    + `C${f(x * .9)},${f(-y * .85)} ${f(x * .3)},${f(-y * 1.1)} ${f(x * .08)},${f(-y * .62)} `
    + `C${f(-x * .1)},${f(-y * 1.15)} ${f(-x * .72)},${f(-y * 1.0)} ${f(-x * .68)},${f(-y * .25)} `
    + `C${f(-x * 1.08)},${f(-y * .25)} ${f(-x * 1.1)},${f(y)} ${f(-x * .78)},${f(y)} Z`;
}
/* the valve on a pipe: a bow tie across the flow, with a handle on top */
const valve = (x, y, ang) => `<g class="valve" transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><path class="v-stem" d="M0 0 V-17"/><circle class="v-knob" cy="-21" r="5"/><path class="v-tie" transform="rotate(${ang.toFixed(1)})" d="M-12 -9 L12 9 V-9 L-12 9 Z"/></g>`;

/* === RENDER === draws a state into an <svg>; also used by the worked example and the print page */
export function render(svg, st, { sel = null, pending = null, viewBox = null } = {}) {
  const byId = Object.fromEntries(st.nodes.map(n => [n.id, n]));
  const boxes = Object.fromEntries(st.nodes.map(n => [n.id, box(n)]));
  let pipes = '', labels = '', valves = '', links = '';
  const valveAt = {};
  /* flows are pipes with a valve; the name sits under the valve */
  for (const f of st.flows) {
    const a = byId[f.from], b = byId[f.to];
    if (!a || !b) continue;
    const p = flowPath(a, b, boxes[a.id], boxes[b.id]);
    valveAt[f.id] = { x: p.lx, y: p.ly };
    const lab = f.label || 'Name this process';
    const lw = lab.length * 8.2 + 22 + (f.human ? 20 : 0);
    const cls = `cy-flow${f.human ? ' human' : ''}${sel === f.id ? ' sel' : ''}${pending === f.id ? ' pending' : ''}`;
    const ly = p.ly + 30;
    pipes += `<g class="${cls}" data-id="${esc(f.id)}"><path class="hit" d="${p.d}"/><path class="pipe-o" d="${p.pipe}"/><path class="pipe-i" d="${p.pipe}"/><path class="head" d="${p.head}"/></g>`;
    valves += `<g class="${cls}" data-id="${esc(f.id)}">${valve(p.lx, p.ly, p.ang)}</g>`;
    labels += `<g class="${cls}" data-id="${esc(f.id)}">
      <rect class="lab-bg" x="${(p.lx - lw / 2).toFixed(1)}" y="${(ly - 15).toFixed(1)}" width="${lw.toFixed(1)}" height="30" rx="15"/>
      <text class="lab${f.label ? '' : ' empty'}" x="${(p.lx + (f.human ? 10 : 0)).toFixed(1)}" y="${(ly + 5.5).toFixed(1)}">${esc(lab)}</text>
      ${f.human ? `<text class="lab-ico" x="${(p.lx - lw / 2 + 15).toFixed(1)}" y="${(ly + 6).toFixed(1)}">!</text>` : ''}
    </g>`;
  }
  /* + and − arrows run between pieces and valves */
  for (const l of st.links || []) {
    const a = byId[l.from] || valveAt[l.from], b = byId[l.to] || valveAt[l.to];
    if (!a || !b) continue;
    const p = linkPath(a, b, boxes[l.from], boxes[l.to]);
    const pos = l.sign !== '-';
    links += `<g class="cy-link ${pos ? 'pos' : 'neg'}${sel === l.id ? ' sel' : ''}" data-id="${esc(l.id)}"><path class="hit" d="${p.d}"/><path class="line" d="${p.d}"/><path class="head" d="${p.head}"/>
      <circle class="sgn-bg" cx="${p.sx.toFixed(1)}" cy="${p.sy.toFixed(1)}" r="12"/><text class="sgn" x="${p.sx.toFixed(1)}" y="${(p.sy + 6).toFixed(1)}">${pos ? '+' : '−'}</text></g>`;
  }
  let nodes = '';
  for (const n of st.nodes) {
    const b = boxes[n.id];
    const ty = n.y - (b.lines.length - 1) * 12 + 7;
    const tx = n.x + (n.kind === 'cloud' ? 0 : 16);
    const shape = n.kind === 'cloud'
      ? `<path class="shape" transform="translate(${n.x},${n.y})" d="${cloudPath(b.w, b.h)}"/>`
      : `<rect class="shape" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${n.kind === 'human' ? 14 : 6}"/>`;
    const ico = n.kind === 'cloud' ? '' : `<path class="ic" transform="translate(${b.x + 26},${n.y}) scale(1.05)" d="${iconPath(iconFor(n.label, n.kind))}"/>`;
    const tag = n.kind === 'cloud' ? `<text class="tag" x="${n.x}" y="${b.y + b.h - 12}">outside the system</text>` : '';
    nodes += `<g class="cy-node ${n.kind}${sel === n.id ? ' sel' : ''}${pending === n.id ? ' pending' : ''}" data-id="${esc(n.id)}">${shape}${ico}
      <text class="nm" x="${tx}" y="${n.kind === 'cloud' ? ty - 6 : ty}">${b.lines.map((l, i) => `<tspan x="${tx}" dy="${i ? 24 : 0}">${esc(l)}</tspan>`).join('')}</text>${tag}</g>`;
  }
  /* pipes, then pieces, then arrows, valves and names on top so nothing hides them */
  const out = pipes + nodes + links + valves + labels;
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
    [`Every flow is a pipe with a process name (${st.flows.length} flows${unnamedFlows ? `, ${unnamedFlows} unnamed` : ''})`, st.flows.length >= 3 && !unnamedFlows],
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
      <p class="ps-legend"><span class="lg stock">Stock (pool)</span><span class="lg flow">Flow (pipe and valve)</span><span class="lg hflow">Human-caused flow</span><span class="lg pos">+ same direction</span><span class="lg neg">− opposite direction</span><span class="lg human">Human touchpoint</span><span class="lg cloud">Outside the system</span></p></section>
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
  const nid = p => { let id; do id = `${p}${seq++}`; while (find(id)); return id; };
  const find = id => st.nodes.find(n => n.id === id) || st.flows.find(f => f.id === id) || (st.links || []).find(l => l.id === id);

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
      <div class="cy-pal-list">${p.stocks.map(x => `<button type="button" class="pi stock${used.has(x) ? ' used' : ''}" data-add="stock" data-v="${esc(x)}">${picon(x, 'stock')}${esc(x)}</button>`).join('')}</div>
      <h5><span class="sw f"></span>Processes / flows <small>click, then FROM → TO</small></h5>
      <div class="cy-pal-list">${p.flows.map(x => `<button type="button" class="pi flow${usedF.has(x) ? ' used' : ''}" data-add="flow" data-v="${esc(x)}">${picon(x, 'flow')}${esc(x)}</button>`).join('')}</div>
      <h5><span class="sw h"></span>Human impacts <small>click, then the stock it changes</small></h5>
      <div class="cy-pal-list">${p.human.map(([c, f]) => `<button type="button" class="pi human${used.has(c) ? ' used' : ''}" data-add="human" data-v="${esc(c)}" data-f="${esc(f)}">${picon(c, 'human')}<b>${esc(c)}</b><span>${esc(f)}</span></button>`).join('')}</div>`;
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
    const isLink = 'sign' in it;
    ui('pname-row').hidden = isLink;
    ui('psign-row').hidden = !isLink;
    if (isLink) {
      ui('ptype').textContent = it.sign === '-' ? '− arrow' : '+ arrow';
      ui('psign').textContent = it.sign === '-' ? 'The two change in opposite directions. Flip to +' : 'The two change in the same direction. Flip to −';
      ui('phuman-row').hidden = true; ui('pnote-row').hidden = true;
      return;
    }
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
  ui('psign').addEventListener('click', () => { const it = find(sel); if (!it || !('sign' in it)) return; snap(); it.sign = it.sign === '-' ? '+' : '-'; changed(); });
  ui('pdelete').addEventListener('click', () => remove(sel));
  ui('pdone').addEventListener('click', () => { sel = null; draw(); });

  function remove(id) {
    if (!id) return;
    snap();
    st.nodes = st.nodes.filter(n => n.id !== id);
    const gone = new Set([id, ...st.flows.filter(f => f.from === id || f.to === id).map(f => f.id)]);
    st.flows = st.flows.filter(f => !gone.has(f.id));
    st.links = (st.links || []).filter(l => !gone.has(l.id) && !gone.has(l.from) && !gone.has(l.to));
    sel = null; changed();
  }

  /* --- tools --- */
  const TIPS = {
    move: 'Drag pieces to move them. Click one to name or delete it.',
    stock: 'Click the canvas to add a stock (a pool where the element is stored).',
    human: 'Click the canvas to add a human touchpoint (a city, farm, factory or car).',
    cloud: 'Click the canvas to add a cloud: where matter enters or leaves your system.',
    flow: 'Click the piece the element flows FROM, then the piece it flows TO. A pipe and valve appear between them.',
    pos: '+ arrow: click what changes first (a piece or a valve), then what it pushes the same way.',
    neg: '− arrow: click what changes first (a piece or a valve), then what it pushes the opposite way.',
    erase: 'Click any stock, cloud, human impact, pipe or arrow to erase it. Undo brings it back.',
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
    if (mode === 'erase') { if (id) remove(id); return; }
    if (mode === 'pos' || mode === 'neg') {
      if (!id || g.classList.contains('cy-link')) return;
      if (!pending) { pending = id; ui('tip').textContent = mode === 'pos' ? 'Now click what it pushes the SAME way.' : 'Now click what it pushes the OPPOSITE way.'; draw(); return; }
      if (pending === id) { pending = null; draw(); return; }
      snap();
      st.links = st.links || [];
      const l = { id: nid('l'), from: pending, to: id, sign: mode === 'pos' ? '+' : '-' };
      st.links.push(l); sel = l.id; setMode('move'); changed();
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
      ui('saved').textContent = 'This browser blocked saving. Use Print / Save as PDF to keep a copy.';
      ui('saved').className = 'cy-saved err';
    }
  }
  setInterval(() => { if (dirty) saveDraft('auto'); }, AUTOSAVE_MS);
  addEventListener('pagehide', () => { if (dirty) saveDraft('auto'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && dirty) saveDraft('auto'); });
  ui('save-now').addEventListener('click', () => saveDraft('now'));

  /* only keep known fields from a file or draft; ids are letters, digits and dashes only */
  const safeId = v => String(v ?? '').replace(/[^\w-]/g, '').slice(0, 20) || 'x';
  function clean(d) {
    if (!d || !Array.isArray(d.nodes) || !Array.isArray(d.flows)) throw new Error('bad file');
    const s = blank();
    fields.forEach(f => { s[f] = String(d[f] ?? '').slice(0, 2000); });
    s.nodes = d.nodes.slice(0, 80).map(n => ({ id: safeId(n.id), kind: ['stock', 'human', 'cloud'].includes(n.kind) ? n.kind : 'stock', x: Math.max(60, Math.min(W - 60, Number(n.x) || 100)), y: Math.max(36, Math.min(H - 36, Number(n.y) || 100)), label: String(n.label ?? '').slice(0, 60) }));
    s.flows = d.flows.slice(0, 120).map(f => ({ id: safeId(f.id), from: safeId(f.from), to: safeId(f.to), label: String(f.label ?? '').slice(0, 60), human: !!f.human, note: String(f.note ?? '').slice(0, 300) }));
    s.links = (Array.isArray(d.links) ? d.links : []).slice(0, 80).map(l => ({ id: safeId(l.id), from: safeId(l.from), to: safeId(l.to), sign: l.sign === '-' ? '-' : '+' }));
    return s;
  }

  function load(data, keep) {
    if (keep) snap();
    st = JSON.parse(JSON.stringify(data)); st.links = st.links || [];
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

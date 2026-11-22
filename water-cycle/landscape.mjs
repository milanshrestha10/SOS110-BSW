// Fig 2 · The water cycle as an isometric landscape block.
// A cut-away block of land: grass over soil over a water-bearing aquifer over bedrock, with a lake,
// a forest, two snow-capped mountains, a river, clouds and the sun. Six stages light up in turn;
// every number on the card comes from FLUX (Trenberth et al. 2007; groundwater share from USGS).
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const SKILL = join(homedir(), ".claude/skills/anatomy");
const k = await import(join(SKILL, "kit/iso-kit.mjs"));
const G = await import(join(SKILL, "kit/lathe.mjs"));
const { kitScript } = await import(join(SKILL, "scripts/inline-kit.mjs"));

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

// ---------- Truth ----------
const FLUX = { oceanEvap: 413000, landET: 73000, transport: 40000, oceanRain: 373000, landRain: 113000, runoff: 40000 };
if (FLUX.oceanEvap + FLUX.landET !== FLUX.oceanRain + FLUX.landRain) throw new Error("global balance");
if (FLUX.landRain !== FLUX.landET + FLUX.runoff) throw new Error("land balance");
const fmt = (n) => n.toLocaleString("en-US");
const STAGES = [
  { name: "Evaporation", text: `${fmt(FLUX.oceanEvap)} km³/yr off oceans & lakes` },
  { name: "Transpiration", text: `${fmt(FLUX.landET)} km³/yr from plants & soil` },
  { name: "Condensation", text: `vapour cools into clouds; ${fmt(FLUX.transport)} km³/yr moves inland` },
  { name: "Precipitation", text: `${fmt(FLUX.oceanRain + FLUX.landRain)} km³/yr of rain & snow` },
  { name: "Surface runoff", text: `${fmt(FLUX.runoff)} km³/yr returns by rivers & aquifers` },
  { name: "Groundwater", text: "about 30% of Earth's fresh water" },
];

// ---------- Palette: one base colour per material, shaded in four tones by facing ----------
const MAT = {
  grass: "#6fae4f", soil: "#8b6a47", aquifer: "#4f86b8", rock: "#6f6a66", mountain: "#9a9fa6", snow: "#f3f5f7",
  tree: "#2f7d3a", trunk: "#6b4a2e", cloud: "#ffffff", storm: "#a9b3bd", sun: "#f6c343",
};
const WATER = "#3f8fd6";
const mix = (hex, f) => "#" + [1, 3, 5].map((i) => Math.round(Math.min(255, parseInt(hex.slice(i, i + 2), 16) * f)).toString(16).padStart(2, "0")).join("");
const matCss = Object.entries(MAT).map(([name, c]) => {
  const top = mix(c, 1.08), sh = [0.66, 0.76, 0.86, 0.95].map((f) => mix(c, f)), m = `.iso .iso-solid.m-${name}`;
  return `${m}>.iso-fill{fill:${sh[2]}}${m}>.iso-top{fill:${top};stroke:${top}}` +
    sh.map((v, i) => `${m}>.iso-shade[data-shade="${i}"]{fill:${v};stroke:${v}}`).join("") +
    `${m}>.iso-edge{stroke:${mix(c, 0.45)}}${m}>.iso-crease{stroke:${mix(c, 0.6)}}`;
}).join("");

// ---------- World ----------
const WIDTH = 680, HEIGHT = 580;
const BLOCK = { x: -160, y: -100, w: 320, d: 200, r: 10 };
const LAYERS = [ // bottom to top
  { mat: "rock", z: -50, h: 14 },
  { mat: "aquifer", z: -36, h: 14 },
  { mat: "soil", z: -22, h: 18 },
  { mat: "grass", z: -4, h: 4 },
];
const MOUNTAINS = [
  { at: [52, -42], R: 58, H: 118, snow: 0.72 },
  { at: [112, 30], R: 42, H: 84, snow: 0.74 },
];
const profileOf = ({ R, H }) => [[0, R], [H * 0.25, R * 0.62, 1], [H * 0.6, R * 0.28, 1], [H * 0.9, R * 0.06, 1], [H, 0]];
// height of a mountain's surface at distance d from its axis (inverse of the profile), 0 off the mountain
function mountainHeight(m, x, y) {
  const d = Math.hypot(x - m.at[0], y - m.at[1]);
  const pr = profileOf(m);
  if (d >= pr[0][1]) return 0;
  for (let i = 0; i < pr.length - 1; i++) {
    const [s0, r0] = pr[i], [s1, r1] = pr[i + 1];
    if (d <= r0 && d >= r1) return s0 + (s1 - s0) * ((r0 - d) / (r0 - r1));
  }
  return m.H;
}
const groundAt = (x, y) => Math.max(0, ...MOUNTAINS.map((m) => mountainHeight(m, x, y)));

// lake: an organic outline on the grass
const LAKE_C = [-78, 18];
const LAKE = Array.from({ length: 72 }, (_, i) => {
  const t = (i / 72) * Math.PI * 2;
  const r = 1 + 0.12 * Math.sin(3 * t + 0.6) + 0.07 * Math.sin(5 * t + 2);
  return [LAKE_C[0] + Math.cos(t) * 62 * r, LAKE_C[1] + Math.sin(t) * 44 * r];
});
const inLake = (x, y) => ((x - LAKE_C[0]) / 70) ** 2 + ((y - LAKE_C[1]) / 52) ** 2 < 1;
// river from the foot of the far mountain to the lake shore
const RIVER = [[96, -6], [70, 18], [44, 30], [18, 24], [-6, 34], [-18, 30]];

const CLOUDS = [
  { at: [-70, -30, 150], puffs: [[0, 0, 0, 16], [16, 4, -2, 13], [-15, 2, -3, 12], [6, -10, 4, 11], [-4, 12, -4, 10]], mat: "cloud" },
  { at: [80, 0, 172], puffs: [[0, 0, 0, 19], [20, 6, -3, 15], [-19, 2, -3, 15], [6, -14, 4, 13], [-6, 16, -4, 12], [30, -6, -6, 10]], mat: "storm" },
  { at: [-10, -80, 166], puffs: [[0, 0, 0, 12], [13, 3, -2, 9], [-12, 2, -2, 9]], mat: "cloud" },
];
const SUN = [-150, -96, 196];

const P = k.fitProjection(
  [...k.boxCorners(BLOCK, -50, 0), [MOUNTAINS[0].at[0], MOUNTAINS[0].at[1], MOUNTAINS[0].H], [SUN[0], SUN[1], SUN[2] + 20], [80, 0, 192]],
  WIDTH, HEIGHT, { pad: 30, azimuth: 40 },
);
const at = (p) => k.iso(p, P);
const S = (paths, mat, style = {}) => k.solidSvg(paths, { crease: "none", ...style, className: `m-${mat}` });
const L = (d, style) => k.lineSvg(d, style);
const depth = (p) => k.depthOf(p, P);
const up = (x, y, z) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const path = (pts) => "M" + pts.map((p) => at(p).map((v) => v.toFixed(1)).join(" ")).join("L");

// ---------- Block with its strata ----------
function block() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BLOCK, -50, 50, P)}"/>`];
  for (const { mat, z, h } of LAYERS) out.push(S(k.slabOf(BLOCK, z, h, P, 10), mat));
  // pebbles in the aquifer and stones in the bedrock, on the two visible faces
  const rng = seeded(11), dots = [];
  for (let i = 0; i < 150; i++) {
    const face = rng() < 0.55, z = -48 + rng() * 26;
    const p = face ? [BLOCK.x + 12 + rng() * (BLOCK.w - 24), BLOCK.y + BLOCK.d, z] : [BLOCK.x + BLOCK.w, BLOCK.y + 12 + rng() * (BLOCK.d - 24), z];
    dots.push(at(p));
  }
  out.push(`<g class="strata">${k.dotsSvg(dots, { size: 0.7, tone: "lo" })}</g>`);
  return out.join("");
}

function seeded(s) { return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// ---------- Surface: lake and river ----------
function surface() {
  const lake = path(LAKE.map(([x, y]) => [x, y, 0])) + "Z";
  const out = [`<path class="lake" d="${lake}"/>`];
  out.push([0.78, 0.55].map((f) => `<path class="lake-ripple" d="${path(LAKE.map(([x, y]) => [LAKE_C[0] + (x - LAKE_C[0]) * f, LAKE_C[1] + (y - LAKE_C[1]) * f, 0]))}Z"/>`).join(""));
  const river = G.fillet(RIVER.map(([x, y]) => [x, y, 0]), 10);
  out.push(`<path class="river" d="${path(river)}"/>`);
  out.push(`<g data-stage="5"><path class="iso-line flowline" data-flow="" d="${path(river)}"/></g>`);
  return out.join("");
}

// ---------- Objects that stand on the ground, painted back to front ----------
function mountain(m) {
  const [x, y] = m.at, F = up(x, y, 0), pr = profileOf(m);
  const snowS = m.H * m.snow;
  const out = [S(G.solidOf(pr, F, P), "mountain")];
  // snow cap: the same curve above the snow line, a hair larger so it sits on the rock
  const r = (s) => { for (let i = 0; i < pr.length - 1; i++) { const [s0, r0] = pr[i], [s1, r1] = pr[i + 1]; if (s >= s0 && s <= s1) return r0 + (r1 - r0) * ((s - s0) / (s1 - s0)); } return 0; };
  const cap = [[snowS, r(snowS) + 0.4], [snowS + (m.H - snowS) * 0.5, r(snowS + (m.H - snowS) * 0.5) + 0.4, 1], [m.H + 0.3, 0]];
  out.push(S(G.solidOf(cap, F, P), "snow"));
  return { key: depth([x, y, 0]) - 20, svg: out.join("") };
}

function tree(x, y, s) {
  const z = groundAt(x, y);
  const out = [S(k.cylinder(x, y, 1.3 * s, z, 4 * s, P, 12), "trunk")];
  out.push(S(G.solidOf([[0, 6 * s], [6 * s, 4.2 * s], [6.01 * s, 4.8 * s], [12 * s, 2.4 * s], [12.01 * s, 3 * s], [17 * s, 0]], up(x, y, z + 4 * s), P), "tree"));
  return { key: depth([x, y, 0]), svg: out.join(""), top: [x, y, z + 21 * s] };
}

const rng = seeded(5);
const TREES = [];
// forest between the lake and the mountains, and along the back
for (let i = 0; i < 70 && TREES.length < 26; i++) {
  const x = -150 + rng() * 170, y = -92 + rng() * 120;
  if (inLake(x, y) || groundAt(x, y) > 0 || Math.hypot(x - 52, y + 42) < 66) continue;
  if (TREES.some((t) => Math.hypot(t.x - x, t.y - y) < 12)) continue;
  TREES.push({ x, y, s: 0.8 + rng() * 0.45 });
}
for (const [x, y] of [[132, -70], [146, -50], [8, 70], [24, 82], [-10, 84], [150, 80], [136, 88]]) TREES.push({ x, y, s: 0.9 });
const trees = TREES.map(({ x, y, s }) => tree(x, y, s));

function cloud(c) {
  const puffs = c.puffs.map(([dx, dy, dz, r]) => ({ p: [c.at[0] + dx, c.at[1] + dy, c.at[2] + dz], r })).sort((a, b) => depth(a.p) - depth(b.p));
  return `<g data-glow="${c.mat === "storm" ? 4 : 3}">${puffs.map(({ p, r }) => S(G.sphereOf(p, r, P), c.mat)).join("")}</g>`;
}

const ground = [...MOUNTAINS.map(mountain), ...trees].sort((a, b) => a.key - b.key).map((i) => i.svg).join("");

// ---------- Flows ----------
const wave = (from, to, amp, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n;
  return [from[0] + (to[0] - from[0]) * t + Math.sin(t * Math.PI * 3) * amp, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t];
});
const evap = [[-98, 4], [-72, 30], [-58, -2], [-84, 40]].map(([x, y]) => wave([x, y, 0.2], [x + 12, y - 28, 132], 3));
const transpire = trees.filter((_, i) => i % 4 === 0).slice(0, 5).map((t) => wave(t.top, [-48, -44, 136], 2));
const drift = [wave([-48, -30, 152], [56, -2, 170], 0, 12), wave([-46, -18, 146], [58, 10, 164], 0, 12)];
const flows = (paths, n) => `<g data-stage="${n}">${paths.map((p) => `<path class="iso-line flowline" data-flow="" d="${path(p)}"/>`).join("")}</g>`;
// groundwater: seeps along the aquifer on both visible faces toward the lake side, and soaks down beside the river
const yF = BLOCK.y + BLOCK.d, xF = BLOCK.x + BLOCK.w;
const ground1 = [[xF, -80, -29], [xF, 90, -29]], ground2 = [[150, yF, -29], [-150, yF, -29]];
const soak = [30, 60, 90, 120].map((x) => [[x, yF, -4], [x, yF, -22]]);
const groundFlow = `<g data-stage="6">${[ground1, ground2].map((p) => `<path class="iso-line flowline gw" data-flow="" d="${path(p)}"/>`).join("")}${soak.map((p) => `<path class="iso-line flowline gw" data-flow="" d="${path(p)}"/>`).join("")}</g>`;

// rain falls from the storm cloud onto the mountains and the land below it
const RAIN = [];
const rr = seeded(3);
for (let i = 0; i < 26; i++) { const x = 52 + rr() * 64, y = -20 + rr() * 44; RAIN.push([x, y, groundAt(x, y)]); }

// ---------- Labels, anchored to the world ----------
const LABELS = [
  { n: 1, text: "Evaporation", p: [-120, 44, 70], anchor: "end" },
  { n: 2, text: "Transpiration", p: [-150, -84, 34], anchor: "end" },
  { n: 3, text: "Condensation", p: [-70, -30, 178], anchor: "middle" },
  { n: 4, text: "Precipitation", p: [130, 0, 150], anchor: "start" },
  { n: 5, text: "Surface runoff", p: [-2, 62, 0], anchor: "middle", dy: 16 },
  { n: 6, text: "Groundwater", p: [xF, 40, -29], anchor: "start", dy: 4, dx: 10 },
];
const labels = LABELS.map(({ n, text, p, anchor, dy = 0, dx = 0 }) => { const [x, y] = at(p); return `<text class="lbl" data-label="${n}" x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}">${text}</text>`; }).join("");

const sun = `<g data-glow="1"><circle class="sun-glow" cx="${at(SUN)[0].toFixed(1)}" cy="${at(SUN)[1].toFixed(1)}" r="34"/>${S(G.sphereOf(SUN, 16, P), "sun")}</g>`;

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "An isometric block of land cut away to show grass, soil, a water-bearing aquifer and bedrock. On top are a lake, a forest, a river and two snow-capped mountains, with the sun and three clouds above. Flowing lines show water evaporating from the lake, transpiring from trees, drifting as cloud, falling as rain on the mountains, running off down the river and seeping through the aquifer.",
  body: [sun, block(), surface(), groundFlow, ground, flows(evap, 1), flows(transpire, 2), flows(drift, 3), `<g data-stage="4" data-part="rain"></g>`, CLOUDS.map(cloud).join(""), labels],
});

const live = `
const P = ${JSON.stringify(P)};
const STAGES = ${JSON.stringify(STAGES)};
const RAIN = ${JSON.stringify(RAIN)}, TOP = 160;
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const rainG = svg.querySelector('[data-part="rain"]');
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const at = (p) => iso(p, P);
const G = 300, phase = RAIN.map((_, i) => (i * 0.61) % 1);
let current = 0, clock = 0, last = 0, frame = 0, visible = false, touring = true, idle = 0, t = 0;
function setStage(i) {
  current = i;
  svg.querySelectorAll("[data-stage]").forEach((g) => g.toggleAttribute("data-on", Number(g.dataset.stage) === i + 1));
  svg.querySelectorAll("[data-label]").forEach((g) => g.toggleAttribute("data-on", Number(g.dataset.label) === i + 1));
  svg.querySelectorAll("[data-glow]").forEach((g) => g.toggleAttribute("data-on", Number(g.dataset.glow) === i + 1));
  const text = (i + 1) + " · " + STAGES[i].name + " — " + STAGES[i].text;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(i + 1));
  stage.setAttribute("aria-valuetext", STAGES[i].name);
}
function drawRain() {
  if (current !== 3 || still.matches) { if (rainG.firstChild) rainG.innerHTML = ""; return; }
  let html = "";
  RAIN.forEach(([x, y, floor], i) => {
    const span = TOP - floor, fall = Math.sqrt(2 * span / G);
    const s = ((t / fall + phase[i]) % 1) * fall, z = TOP - 0.5 * G * s * s;
    const a = at([x, y, Math.max(floor, z)]), b = at([x - 1.5, y + 1.5, Math.max(floor, z) + 8]);
    html += '<path class="drop" d="M' + b[0].toFixed(1) + " " + b[1].toFixed(1) + "L" + a[0].toFixed(1) + " " + a[1].toFixed(1) + '"/>';
  });
  rainG.innerHTML = html;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now; t += dt;
  if (touring) { clock += dt; const next = Math.floor(clock / 3.6) % STAGES.length; if (next !== current) setStage(next); }
  drawRain();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (i) => { touring = false; if (i !== current) setStage(i); clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches; clock = current * 3.6; }, 5000); run(); };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
svg.querySelectorAll("[data-label]").forEach((el) => el.addEventListener("pointerenter", () => steer(Number(el.dataset.label) - 1)));
stage.addEventListener("pointermove", (ev) => {
  if (ev.target.closest && ev.target.closest("[data-label]")) return;
  const box = svg.getBoundingClientRect();
  steer(Math.floor(Math.min(0.999, Math.max(0, (ev.clientX - box.left) / box.width)) * STAGES.length));
});
stage.addEventListener("keydown", (ev) => {
  let to = null;
  if (ev.key === "ArrowRight" || ev.key === "ArrowUp") to = (current + 1) % STAGES.length;
  if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") to = (current + STAGES.length - 1) % STAGES.length;
  if (to === null) return;
  ev.preventDefault(); steer(to);
});
window.waterCycle = { setStage: (i) => { touring = false; setStage(i); } };
setStage(0);
`;

const css = `<style>
${matCss}
.lake{fill:${WATER};stroke:${mix(WATER, 0.6)};stroke-width:.8}
.lake-ripple{fill:none;stroke:${mix(WATER, 1.25)};stroke-width:.6;opacity:.6}
.river{fill:none;stroke:${WATER};stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}
.strata .iso-dots circle,.strata circle{fill:#000;opacity:.18}
.flowline{stroke:var(--anatomy-strong);stroke-width:1.2;fill:none}
.flowline.gw{stroke:#bfe0ff}
.river + g .flowline{stroke:#e8f4ff}
[data-stage]{opacity:0;transition:opacity .7s var(--anatomy-ease)}
[data-stage][data-on]{opacity:1}
.iso-line.flowline[data-flow]{animation-play-state:paused}
[data-on] .iso-line.flowline[data-flow]{animation-play-state:running}
.drop{stroke:#7cc0ff;stroke-width:1.1;stroke-linecap:round}
.iso[data-theme="light"] .drop{stroke:#1f6fbf}
.iso[data-theme="light"] .flowline{stroke:#1d3d5c}
.iso[data-theme="light"] .flowline.gw{stroke:#0e4f8f}
.sun-glow{fill:${MAT.sun};opacity:.12;filter:blur(8px);transition:opacity .7s}
[data-glow="1"][data-on] .sun-glow{opacity:.55}
[data-glow="4"] .iso-solid{transition:opacity .7s}
.lbl{paint-order:stroke;stroke:var(--anatomy-card);stroke-width:3.5px;stroke-linejoin:round;font:600 12px system-ui,-apple-system,"Segoe UI",sans-serif;fill:var(--anatomy-muted);letter-spacing:.02em;cursor:pointer;transition:fill .4s}
.lbl[data-on]{fill:var(--anatomy-strong)}
.iso-plate{--anatomy-paper:var(--anatomy-card)}
</style>`;

const body = css + k.plateHtml({
  fig: "Fig 2",
  title: "The water cycle",
  hint: "Hover a label or move across",
  readout: `1 · ${STAGES[0].name} — ${STAGES[0].text}`,
  keys: [
    { mark: "blue", label: "Water: lake, river and the aquifer layer underground" },
    { mark: "lit", label: "The flow of the current stage" },
  ],
  caption: `The sun lifts ${fmt(FLUX.oceanEvap)} km³ of water a year off oceans and lakes, and plants add ${fmt(FLUX.landET)} km³ by transpiration. Rising vapour cools and condenses into clouds, which drift inland and fall as ${fmt(FLUX.oceanRain + FLUX.landRain)} km³ of rain and snow, 77% of it over the ocean. On land, water runs off downhill into rivers and lakes or soaks through the soil into the aquifer, where groundwater holds about 30% of Earth's fresh water, and seeps back to the sea. Fluxes: Trenberth et al. (2007); groundwater share: USGS.`,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Water cycle: arrow keys step through the six stages" aria-valuemin="1" aria-valuemax="6" aria-valuenow="1">${svg}</div>`,
});

const name = theme === "light" ? "water-cycle-landscape-light.html" : "water-cycle-landscape.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "The water cycle", theme, body, script: kitScript() + live, width: 740 }));
console.log("wrote", name);

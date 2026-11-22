// Fig 1 · The water cycle, built as a bench rig.
// A heat lamp (the sun) warms an ocean tray; vapour rises to a finned cold plate (the atmosphere),
// beads on its edge, falls as rain on the ocean and on a stepped hillside with trees,
// and returns through a flume (runoff) while a sight glass shows groundwater filling.
// Every number on the card comes from FLUX below (Trenberth et al. 2007, km³ per year).
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const SKILL = join(homedir(), ".claude/skills/anatomy");
const k = await import(join(SKILL, "kit/iso-kit.mjs"));
const { kitScript } = await import(join(SKILL, "scripts/inline-kit.mjs"));

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

// ---------- Truth: global water fluxes, km³ / year ----------
const FLUX = { oceanEvap: 413000, landET: 73000, transport: 40000, oceanRain: 373000, landRain: 113000, runoff: 40000 };
// Balance checks: what leaves the surface comes back down, and land rain = land ET + runoff.
if (FLUX.oceanEvap + FLUX.landET !== FLUX.oceanRain + FLUX.landRain) throw new Error("global balance");
if (FLUX.landRain !== FLUX.landET + FLUX.runoff) throw new Error("land balance");
const fmt = (n) => n.toLocaleString("en-US");
const STAGES = [
  { name: "Evaporation", text: `${fmt(FLUX.oceanEvap)} km³/yr off oceans` },
  { name: "Transpiration", text: `${fmt(FLUX.landET)} km³/yr off land` },
  { name: "Condensation", text: `${fmt(FLUX.transport)} km³/yr drifts inland` },
  { name: "Precipitation", text: `${fmt(FLUX.oceanRain + FLUX.landRain)} km³/yr, 77% at sea` },
  { name: "Runoff", text: `${fmt(FLUX.runoff)} km³/yr back to sea` },
];
// Rain drops split in the true ratio of ocean to land rain (373 : 113 ≈ 3.3 : 1).
const OCEAN_DROPS = 10, LAND_DROPS = 3;

// ---------- World layout (z up, ~1 px units) ----------
const WIDTH = 640, HEIGHT = 560;
const PLATE = { x: -150, y: -72, w: 300, d: 144, r: 8 }, PLATE_H = 12, FOOT_H = 5;
const TRAY = { x: -138, y: -56, w: 110, d: 100, r: 6 }, TRAY_H = 18;
const TIERS = [
  { plan: { x: 4, y: -56, w: 132, d: 80, r: 6 }, z: 0, h: 16 },
  { plan: { x: 22, y: -48, w: 96, d: 62, r: 5 }, z: 16, h: 14 },
  { plan: { x: 44, y: -40, w: 58, d: 44, r: 4 }, z: 30, h: 14 },
];
const FLUME = { x: -28, y: 30, w: 124, d: 10, r: 1.5 }, FLUME_H = 6;
const COLD = { x: -70, y: -46, w: 190, d: 74, r: 5 }, COLD_Z = 140, COLD_H = 6;
const POSTS = [[-60, -66], [110, -66]], POST_TOP = 150;
const LAMP_POST = [-142, -64], LAMP = [-112, -6], LAMP_Z = 84, LAMP_TOP = 104;
const GLASS = { x0: 24, x1: 60, z0: 4, z1: 12, y: 25.4 };
const DIAL = [128, 48], DIAL_R = 15, DIAL_H = 9;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...k.boxCorners(COLD, COLD_Z, 156), [LAMP_POST[0], LAMP_POST[1], LAMP_TOP + 4]],
  WIDTH, HEIGHT, { pad: 26, azimuth: 40 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const inPlan = (p, x, y) => x > p.x + 1 && x < p.x + p.w - 1 && y > p.y + 1 && y < p.y + p.d - 1;
// Top surface height under a floor point: what a falling drop lands on.
function groundAt(x, y) {
  let top = 0;
  if (inPlan(TRAY, x, y)) top = TRAY_H + 0.5;
  for (const t of TIERS) if (inPlan(t.plan, x, y)) top = Math.max(top, t.z + t.h);
  return top;
}

// ---------- Base plate ----------
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 24))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H + 4, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 11);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // ruler strip along the front edge
  const strip = { x: -88, y: PLATE.y + PLATE.d - 15, w: 186, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  // label plate with rule lines standing for printed text
  const label = { x: -138, y: 52, w: 42, d: 13, r: 1 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P, 3), { tone: "faint" }));
  [[24, 4.6], [30, 7], [16, 9.4]].forEach(([len, y]) => out.push(L(k.lineOnTop([label.x + 5, label.y + y], [label.x + 5 + len, label.y + y], 0.8, P), { tone: "lo", free: true })));
  out.push(D([at([label.x + label.w - 3.4, label.y + 3.4, 0.8]), at([label.x + label.w - 3.4, label.y + label.d - 3.4, 0.8])], { size: 0.45 }));
  return out.join("");
}

// ---------- Posts at the back: two for the cold plate, one for the lamp ----------
function post([x, y], top, r) {
  const out = [];
  out.push(S(k.cylinder(x, y, r + 3, 0, 3, P, 28), { tone: "mid" }));
  out.push(D(k.pointsAt([[x + r + 1.6, y, 3], [x, y + r + 1.6, 3]], P), { size: 0.4, tone: "lo" }));
  out.push(S(k.cylinder(x, y, r, 3, top - 3, P, 24), { tone: "mid", crease: "none", inner: L([40, 80, 120].filter((z) => z < top - 4).map((z) => k.sideArc(x, y, r, z, P, 16)).join(""), { tone: "faint" }) }));
  return out.join("");
}

// ---------- Ocean tray ----------
function tray() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(TRAY, 4), 0, 0.1, P)}" style="filter:blur(5px)"/>`];
  out.push(S(k.slabOf(TRAY, 0, TRAY_H, P, 6, 1), { tone: "mid", inner: L(k.sideSeam(TRAY, 4, P, 6), { tone: "faint" }) }));
  const water = k.insetPlan(TRAY, 3.2);
  out.push(`<g data-glow="1">${S(k.slabOf(water, TRAY_H, 0.5, P, 6), { tone: "hi", crease: "none", flat: true })}</g>`);
  out.push(`<g class="wc-ripples">${[10, 20, 30].map((inset) => L(k.planOutline(k.insetPlan(water, inset), TRAY_H + 0.5, P, 6), { tone: "faint" })).join("")}</g>`);
  out.push(D(k.corners(TRAY, 1.6).map(([x, y]) => at([x, y, TRAY_H])), { size: 0.45, tone: "lo" }));
  // heat ring where the lamp warms the water
  out.push(`<g data-stage="1">${L(k.ring(LAMP[0], LAMP[1], 9, TRAY_H + 0.5, P, 40), { tone: "mid" })}${L(k.ring(LAMP[0], LAMP[1], 4.5, TRAY_H + 0.5, P, 28), { tone: "mid" })}</g>`);
  return out.join("");
}

// ---------- Sun lamp ----------
function lamp() {
  const out = [post(LAMP_POST, LAMP_TOP, 3)];
  const [px, py] = LAMP_POST;
  // L-shaped arm: back along y from the post, then along x out to the lamp, so it stays clear of the cold plate
  out.push(S(k.slabOf({ x: px - 3, y: py - 3, w: 6, d: LAMP[1] - py + 6, r: 1.5 }, LAMP_TOP - 4, 4, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: px - 3, y: LAMP[1] - 3, w: LAMP[0] - px + 6, d: 6, r: 1.5 }, LAMP_TOP - 4, 4, P, 3, 0.4), { tone: "mid" }));
  out.push(D([at([px, py + 12, LAMP_TOP]), at([px + 12, LAMP[1], LAMP_TOP])], { size: 0.42 }));
  const [x, y] = LAMP;
  out.push(S(k.cylinder(x, y, 3, LAMP_Z + 12, LAMP_TOP - 4 - LAMP_Z - 12, P, 20), { tone: "mid" }));
  out.push(`<g data-glow="1">`);
  out.push(S(k.cylinder(x, y, 15, LAMP_Z, 3, P, 56, 0.6), { tone: "hi" }));
  out.push(S(k.cylinder(x, y, 12.5, LAMP_Z + 3, 7, P, 56, 0.6), { tone: "hi", inner: L(k.sideArc(x, y, 12.5, LAMP_Z + 6.5, P, 40), { tone: "faint" }) }));
  out.push(`</g>`);
  out.push(L([4, 7, 10].map((r) => k.ring(x, y, r, LAMP_Z + 10, P, 36)).join(""), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 4, LAMP_Z + 10, 2, P, 24), { tone: "mid" }));
  return out.join("");
}

// ---------- Hillside, flume, sight glass, trees, rain gauge ----------
function hill() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(TIERS[0].plan, 4), 0, 0.1, P)}" style="filter:blur(5px)"/>`];
  TIERS.forEach(({ plan, z, h }, i) => {
    out.push(S(k.slabOf(plan, z, h, P, 6, 0.8), { tone: i === 2 ? "hi" : "mid", inner: L(k.sideSeam(plan, z + h / 2, P, 6), { tone: "faint" }) }));
    out.push(L(k.planOutline(k.insetPlan(plan, 3), z + h, P, 6), { tone: "faint" }));
  });
  // groundwater sight glass on the front face of the lowest tier
  const { x0, x1, z0, z1, y } = GLASS;
  out.push(S(k.slabOf({ x: x0 - 2, y: 24, w: x1 - x0 + 4, d: 1.4, r: 0.4 }, z0 - 2, z1 - z0 + 4, P, 2), { tone: "mid" }));
  const rect = (zt) => `M${at([x0, y, z0]).join(" ")}L${at([x1, y, z0]).join(" ")}L${at([x1, y, zt]).join(" ")}L${at([x0, y, zt]).join(" ")}Z`;
  out.push(`<path class="wc-glass" d="${rect(z1)}"/>`);
  out.push(`<path class="wc-ground" data-part="ground" d="${rect(z0 + 2)}"/>`);
  out.push(L([6, 8, 10].map((z) => k.segment([x0, y, z], [x0 + 3, y, z], P)).join(""), { tone: "lo", free: "end" }));
  out.push(`<path class="iso-line" data-tone="mid" d="${rect(z1)}"/>`);
  out.push(D([at([x0 - 1, y, z0 - 1]), at([x1 + 1, y, z0 - 1]), at([x0 - 1, y, z1 + 1]), at([x1 + 1, y, z1 + 1])], { size: 0.4 }));
  // spout over the flume, cantilevered from the tier face
  out.push(S(k.slabOf({ x: 80, y: 24, w: 10, d: 10, r: 1 }, 9, 3, P, 3, 0.4), { tone: "mid" }));
  return out.join("");
}

function flume() {
  const out = [];
  out.push(S(k.slabOf(FLUME, 0, FLUME_H, P, 3, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(FLUME, 1.8), FLUME_H, P, 3), { tone: "faint" }));
  out.push(D([12, 44, 76].map((x) => at([x, FLUME.y + FLUME.d - 1, FLUME_H])), { size: 0.4, tone: "lo" }));
  out.push(`<g data-stage="5">`);
  out.push(L(k.lineOnTop([FLUME.x + FLUME.w, FLUME.y + FLUME.d / 2], [FLUME.x, FLUME.y + FLUME.d / 2], FLUME_H, P), { tone: "mid", flow: true }));
  out.push(L(k.segment([85, FLUME.y + 4, 9], [85, FLUME.y + 4, FLUME_H], P), { tone: "mid", flow: true }));
  out.push(`</g>`);
  return out.join("");
}

function tree([x, y], z, s) {
  const out = [];
  out.push(S(k.cylinder(x, y, 4 * s, z, 1.4, P, 24), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 2.2 * s, z + 1.4, 12 * s, P, 16), { tone: "mid", crease: "none" }));
  const tiers = [[12, 0, 3.4], [10.2, 3.4, 3.4], [8.4, 6.8, 3.4], [6.6, 10.2, 3.4], [4.8, 13.6, 3.2], [3, 16.8, 2.4], [1.4, 19.2, 0.8]];
  out.push(`<g data-glow="2">`);
  for (const [r, dz, h] of tiers) out.push(S(k.cylinder(x, y, r * s, z + 12 * s + dz * s, h * s, P, 40, 0.5), { tone: "hi" }));
  out.push(`</g>`);
  return { svg: out.join(""), top: [x, y, z + 12 * s + 20 * s] };
}

function gauge([x, y], z) {
  const out = [];
  out.push(S(k.cylinder(x, y, 5.5, z, 1.4, P, 28), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 4, z + 1.4, 9, P, 28), { tone: "hi", inner: L([3, 5, 7].map((h) => k.sideArc(x, y, 4, z + 1.4 + h, P, 20)).join(""), { tone: "lo" }) }));
  out.push(L(k.ring(x, y, 3.2, z + 10.4, P, 24), { tone: "lo" }));
  return out.join("");
}

// ---------- Cold plate (the atmosphere) ----------
function coldPlate() {
  const out = [];
  for (const [x] of POSTS) out.push(S(k.slabOf({ x: x - 4, y: -70, w: 8, d: 26, r: 1.5 }, COLD_Z + COLD_H, POST_TOP - COLD_Z - COLD_H + 2, P, 3, 0.4), { tone: "mid" }));
  out.push(`<g data-glow="3">${S(k.slabOf(COLD, COLD_Z, COLD_H, P, 6, 0.8), { tone: "hi" })}</g>`);
  const fins = [];
  for (let x = COLD.x + 8; x < COLD.x + COLD.w - 14; x += 12) fins.push(x);
  for (const x of fins) out.push(S(k.slabOf({ x, y: COLD.y + 6, w: 2, d: COLD.d - 12, r: 0.5 }, COLD_Z + COLD_H, 7, P, 2), { tone: "mid", crease: "none" }));
  const header = { x: COLD.x + COLD.w - 12, y: COLD.y + 4, w: 7, d: COLD.d - 8, r: 1.2 };
  out.push(S(k.slabOf(header, COLD_Z + COLD_H, 5, P, 3, 0.4), { tone: "mid" }));
  out.push(D([header.y + 8, header.y + header.d - 8].map((yy) => at([header.x + 3.5, yy, COLD_Z + COLD_H + 5])), { size: 0.45 }));
  const knob = [header.x + 3.5, header.y + header.d / 2];
  out.push(S(k.cylinder(knob[0], knob[1], 4.5, COLD_Z + COLD_H + 5, 4, P, 28), { tone: "mid" }));
  out.push(L(k.knurl(knob[0], knob[1], 4.5, COLD_Z + COLD_H + 5, COLD_Z + COLD_H + 9, 28, P), { tone: "lo" }));
  out.push(L(k.lineOnTop(knob, [knob[0] + 4.5, knob[1]], COLD_Z + COLD_H + 9, P), { tone: "hi" }));
  for (const [x, y] of [[COLD.x + 4, COLD.y + 4], [COLD.x + 4, COLD.y + COLD.d - 4]]) out.push(D([at([x, y, COLD_Z + COLD_H])], { size: 0.45 }));
  // condensation beads along the two visible lower edges
  const beads = [];
  for (let x = COLD.x + 6; x < COLD.x + COLD.w - 4; x += 7) beads.push(at([x, COLD.y + COLD.d, COLD_Z - 0.6]));
  for (let y = COLD.y + 6; y < COLD.y + COLD.d - 2; y += 7) beads.push(at([COLD.x + COLD.w, y, COLD_Z - 0.6]));
  out.push(`<g data-stage="3">${D(beads, { size: 0.9, tone: "hi", pulse: true })}</g>`);
  return out.join("");
}

// ---------- Stage dial ----------
const stageAngle = (i) => (i / STAGES.length) * Math.PI * 2;
const needleAt = (angle) => k.lineOnTop([DIAL[0] - Math.sin(angle) * 3, DIAL[1] + Math.cos(angle) * 3], [DIAL[0] + Math.sin(angle) * (DIAL_R - 4), DIAL[1] - Math.cos(angle) * (DIAL_R - 4)], DIAL_H + 0.2, P);
function dial() {
  const [x, y] = DIAL;
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: x - DIAL_R, y: y - DIAL_R, w: DIAL_R * 2, d: DIAL_R * 2, r: DIAL_R }, 0, 0.1, P)}" style="filter:blur(4px)"/>`];
  out.push(S(k.cylinder(x, y, DIAL_R + 2.5, 0, 2, P, 64), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, DIAL_R, 2, DIAL_H - 2, P, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, DIAL_R, DIAL_H - 3, DIAL_H, 84, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, DIAL_R - 2, DIAL_H, P, 64), { tone: "lo" }));
  const ticks = k.radialTicks(x, y, DIAL_R - 2, STAGES.length * 4, 4, DIAL_H, [1.2, 3], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(L(k.ring(x, y, 1.5, DIAL_H, P, 16), { tone: "mid" }));
  out.push(k.faceTextSvg(k.topMatrix([x, y + 7.5], DIAL_H, P, "x"), "H2O", { size: 2.4, tone: "lo", anchor: "middle" }));
  return out.join("");
}

// ---------- Vapour paths (built once; drawn as flowing dashes) ----------
const VAPOUR = [[-62, -20], [-52, 6], [-44, -34], [-38, 18], [-58, 24]];
const trees = [tree([74, -18], 44, 1), tree([36, -36], 30, 0.62)];
const vapour = `<g data-stage="1">${VAPOUR.map(([x, y]) => L(k.segment([x, y, TRAY_H + 0.5], [x, y, COLD_Z], P), { tone: "mid", flow: true })).join("")}</g>`;
const transpire = `<g data-stage="2">${trees.map(({ top: [x, y, z] }) => [-3, 3].map((dx) => L(k.segment([x + dx, y, z], [x + dx, y, COLD_Z], P), { tone: "mid", flow: true })).join("")).join("")}</g>`;

// Rain drops: start points under the cold plate, in the true ocean : land ratio.
const rng = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const DROPS = [];
for (let i = 0; i < OCEAN_DROPS; i++) DROPS.push([-66 + rng() * 34, -42 + rng() * 66]);
for (let i = 0; i < LAND_DROPS; i++) DROPS.push([52 + rng() * 44, -34 + rng() * 34]);
const DROP_FLOOR = DROPS.map(([x, y]) => groundAt(x, y));
const rain = `<g data-stage="4" data-part="rain"></g>`;

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "A bench rig that runs the water cycle. A heat lamp warms a tray of water standing for the ocean; vapour rises to a finned cold plate above, beads on its edge and falls as rain, mostly back into the tray and partly onto a stepped hillside with two trees that also give off vapour. Water leaving the hill runs along a flume back into the tray, and a sight glass in the hill shows groundwater filling. A dial at the front points to the current stage.",
  body: [
    plate(),
    POSTS.map((p) => post(p, POST_TOP, 3.6)).join(""),
    tray(),
    lamp(),
    hill(),
    flume(),
    gauge([102, 4], 30),
    trees.map((t) => t.svg).join(""),
    vapour,
    transpire,
    rain,
    coldPlate(),
    dial(),
    `<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${needleAt(0)}" style="stroke-width:1.1"/>`,
  ],
});

const live = `
const P = ${JSON.stringify(P)};
const STAGES = ${JSON.stringify(STAGES)};
const DROPS = ${JSON.stringify(DROPS)}, FLOOR = ${JSON.stringify(DROP_FLOOR)}, TOP = ${COLD_Z};
const GLASS = ${JSON.stringify(GLASS)}, DIAL = ${JSON.stringify(DIAL)}, DIAL_R = ${DIAL_R}, DIAL_H = ${DIAL_H};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const needle = svg.querySelector('[data-part="needle"]');
const ground = svg.querySelector('[data-part="ground"]');
const rainG = svg.querySelector('[data-part="rain"]');
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const at = (p) => iso(p, P);
const needleAt = ${needleAt.toString().replace("k.lineOnTop", "lineOnTop")};
const stageAngle = (i) => (i / STAGES.length) * Math.PI * 2;
// Each drop falls from the cold plate under gravity (scaled so a fall takes about a second) and restarts.
const G = 260;
const phase = DROPS.map((_, i) => (i * 0.37) % 1);
let current = 0, angle = 0, level = 2, clock = 0, last = 0, frame = 0, visible = false, touring = true, idle = 0, rainClock = 0;
function setStage(i) {
  current = i;
  svg.querySelectorAll("[data-stage]").forEach((g) => g.toggleAttribute("data-on", Number(g.dataset.stage) === i + 1));
  svg.querySelectorAll("[data-glow]").forEach((g) => g.querySelectorAll(".iso-solid").forEach((s) => s.toggleAttribute("data-lit", Number(g.dataset.glow) === i + 1)));
  const text = (i + 1) + " · " + STAGES[i].name + " — " + STAGES[i].text;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(i + 1));
  stage.setAttribute("aria-valuetext", STAGES[i].name);
}
function drawRain(t) {
  if (current !== 3) { if (rainG.firstChild) rainG.innerHTML = ""; return; }
  let html = "";
  DROPS.forEach(([x, y], i) => {
    const span = TOP - FLOOR[i], fall = Math.sqrt(2 * span / G);
    const s = ((t / fall + phase[i]) % 1) * fall;
    const z = TOP - 0.5 * G * s * s;
    const [a, b] = at([x, y, z]), [c, d] = at([x, y, z + 6]);
    html += '<path class="iso-line" data-tone="lit" d="M' + c.toFixed(1) + ' ' + d.toFixed(1) + 'L' + a.toFixed(1) + ' ' + b.toFixed(1) + '"/>';
  });
  rainG.innerHTML = html;
}
function drawGround() {
  const { x0, x1, z0, y } = GLASS, zt = z0 + level;
  const pts = [[x0, y, z0], [x1, y, z0], [x1, y, zt], [x0, y, zt]].map(at);
  ground.setAttribute("d", "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z");
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) { clock += dt; const next = Math.floor(clock / 3.4) % STAGES.length; if (next !== current) setStage(next); }
  // needle: shortest way round to the stage mark, eased
  let want = stageAngle(current), delta = ((want - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  angle = calm ? want : angle + delta * (1 - Math.exp(-dt / 0.3));
  needle.setAttribute("d", needleAt(angle));
  // groundwater: recharges during runoff, drains slowly otherwise
  const target = current === 4 ? 7.6 : 2;
  level += (target - level) * (1 - Math.exp(-dt / (current === 4 ? 1.2 : 6)));
  drawGround();
  rainClock += dt;
  if (!calm) drawRain(rainClock);
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (i) => { touring = false; if (i !== current) setStage(i); clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches; clock = current * 3.4; }, 5000); run(); };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (ev) => {
  const box = svg.getBoundingClientRect();
  const share = Math.min(0.999, Math.max(0, (ev.clientX - box.left) / box.width));
  steer(Math.floor(share * STAGES.length));
});
stage.addEventListener("keydown", (ev) => {
  let to = null;
  if (ev.key === "ArrowRight" || ev.key === "ArrowUp") to = (current + 1) % STAGES.length;
  if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") to = (current + STAGES.length - 1) % STAGES.length;
  if (ev.key === "Home") to = 0;
  if (ev.key === "End") to = STAGES.length - 1;
  if (to === null) return;
  ev.preventDefault();
  steer(to);
});
window.waterCycle = { setStage: (i) => { touring = false; setStage(i); } };
setStage(0);
`;

const css = `<style>
.iso [data-stage]{opacity:.18;transition:opacity .7s var(--anatomy-ease)}
.iso [data-stage][data-on]{opacity:1}
.iso [data-stage] .iso-line[data-flow]{animation-play-state:paused}
.iso [data-stage][data-on] .iso-line{stroke:var(--anatomy-lit)}
.iso [data-stage][data-on] .iso-line[data-flow]{animation-play-state:running}
.iso [data-stage="4"] .iso-line{stroke-width:1}
.wc-glass{fill:var(--anatomy-shade-0);stroke:none}
.wc-ground{fill:var(--anatomy-hi);opacity:.55;stroke:none}
.iso[data-theme="light"] .wc-ground{opacity:.35}
</style>`;

const body = css + k.plateHtml({
  fig: "Fig 1",
  title: "The water cycle",
  hint: "Hover to step through",
  readout: `1 · ${STAGES[0].name} — ${STAGES[0].text}`,
  keys: [
    { mark: "lit", label: "What the current stage moves: heat, vapour, beads, rain or runoff" },
    { mark: "raised", label: "Tray = ocean · cold plate = atmosphere · stepped hill = land" },
    { mark: "flat", label: "Sight glass: groundwater filling from rain that soaks in" },
  ],
  caption: `The sun's heat lifts ${fmt(FLUX.oceanEvap)} km³ of water off the oceans each year and plants and soil add ${fmt(FLUX.landET)} km³ more. The vapour cools, condenses and falls as ${fmt(FLUX.oceanRain + FLUX.landRain)} km³ of rain and snow, 77% of it straight back onto the ocean (10 of the 13 drops here). On land, rain beyond what evaporates — ${fmt(FLUX.runoff)} km³ — runs off in rivers or soaks into groundwater and returns to the sea, closing the loop. Fluxes: Trenberth et al. (2007).`,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Water cycle: arrow keys step through the five stages" aria-valuemin="1" aria-valuemax="5" aria-valuenow="1">${svg}</div>`,
});

const name = theme === "light" ? "water-cycle-light.html" : "water-cycle.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "The water cycle", theme, body, script: kitScript() + live, width: 720 }));
console.log("wrote", name);

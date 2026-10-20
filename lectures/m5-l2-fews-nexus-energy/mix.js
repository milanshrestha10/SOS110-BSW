/* Keep the lights on: a small planning game. Ten blocks of power demand, seven ways to meet them.
   All numbers are teaching numbers on a 0 to 10 scale, not measured data. */
export const DEMAND = 10;
export const MAX_EFF = 3;
export const SOURCES = [
  { id: 'coal', name: 'Coal', icon: 'flame', tone: 'bad', on: true, co2: 10, water: 7, land: 3, cost: 4, note: 'Always on' },
  { id: 'gas', name: 'Natural gas', icon: 'flame', tone: 'gold', on: true, co2: 5, water: 4, land: 2, cost: 3, note: 'Always on' },
  { id: 'nuclear', name: 'Nuclear', icon: 'atom', tone: 'sky', on: true, co2: 1, water: 8, land: 1, cost: 7, note: 'Always on' },
  { id: 'solar', name: 'Solar panels', icon: 'sun', tone: 'gold', on: false, co2: 1, water: 1, land: 3, cost: 5, note: 'Only when the sun shines' },
  { id: 'wind', name: 'Wind turbines', icon: 'wind', tone: 'sky', on: false, co2: 1, water: 0, land: 2, cost: 5, note: 'Only when the wind blows' },
  { id: 'biomass', name: 'Burning energy crops', icon: 'sprout', tone: 'green', on: true, co2: 4, water: 9, land: 10, cost: 5, note: 'Renewable, always on' },
  { id: 'eff', name: 'Use less (efficiency)', icon: 'gauge', tone: 'green', on: false, co2: 0, water: 0, land: 0, cost: 2, note: `Covers one block, up to ${MAX_EFF}` },
];
export const GOALS = [
  { id: 'co2', label: 'Carbon emissions', limit: 20 },
  { id: 'water', label: 'Water use', limit: 30 },
  { id: 'land', label: 'Farmland and food pressure', limit: 15 },
  { id: 'cost', label: 'Cost', limit: 45 },
];
export const MIN_ON = 4;

export function score(plan) {
  const t = { co2: 0, water: 0, land: 0, cost: 0, on: 0, blocks: 0 };
  for (const s of SOURCES) {
    const n = plan[s.id] || 0;
    t.blocks += n;
    t.co2 += n * s.co2; t.water += n * s.water; t.land += n * s.land; t.cost += n * s.cost;
    if (s.on) t.on += n;
  }
  const met = {};
  for (const g of GOALS) met[g.id] = t[g.id] <= g.limit;
  met.on = t.on >= MIN_ON;
  t.full = t.blocks === DEMAND;
  t.met = met;
  t.win = t.full && Object.values(met).every(Boolean);
  return t;
}

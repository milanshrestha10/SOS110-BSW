/* Phoenix food supply: a small stock-and-flow model of the metro area's food on hand.
   All numbers are teaching numbers, not measured data. Stock is counted in "days of food for everyone". */
export const SHOCKS = [
  { id: 'heat', label: 'Heat wave hits harvests', from: 56, to: 70, imports: 0.5 },
  { id: 'road', label: 'Highway and rail closed', from: 140, to: 154, imports: 0.4 },
  { id: 'drought', label: 'Drought year', from: 210, to: 266, imports: 0.8, local: 0.8 },
  { id: 'panic', label: 'Panic buying', from: 294, to: 309, surge: 1 },
];

/* Each slot: [keep, shallow, deep]. Index 0 means "keep it as it is". */
export const SLOTS = [
  { id: 'imports', name: 'Imports', kind: 'Inflow', opts: ['Keep the same trucks and routes', 'Add more trucks and rail cars', 'Sign long contracts with many regions'] },
  { id: 'local', name: 'Local food', kind: 'Inflow', opts: ['Keep the farms and gardens we have', 'Plant more community gardens', 'Change zoning and buying rules to favor local farms'] },
  { id: 'storage', name: 'Storage', kind: 'Stock', opts: ['Keep the warehouses we have', 'Build bigger warehouses', 'Share a live food-supply dashboard so stores restock early'] },
  { id: 'waste', name: 'Waste', kind: 'Outflow', opts: ['Keep throwing away the same amount', 'Run a "waste less food" ad campaign', 'Require stores to donate or compost extra food'] },
  { id: 'goal', name: 'Panic buying', kind: 'Outflow', opts: ['Keep the goal: cheapest food, just in time', 'Ask people not to panic buy', 'Change the goal to dependable food for everyone'] },
];

export function simulate(pick) {
  const p = id => pick[id] || 0;
  let cap = 6, S = 4, target = 4, k = 0.10;
  let importCap = 1.0, localCap = 0.08, eatBase = 0.85, wasteBase = 0.15, surge = 1.3, diversify = false;
  if (p('imports') === 1) importCap += 0.05;
  if (p('imports') === 2) diversify = true;
  if (p('local') === 1) localCap = 0.10;
  if (p('storage') === 1) { cap = 8; S = 5.5; target = 5.5; }
  if (p('storage') === 2) { k = 0.35; target *= 1.25; }
  if (p('waste') === 1) wasteBase = 0.12;
  if (p('goal') === 1) surge = 1.2;
  if (p('goal') === 2) { surge = 1.05; target *= 1.25; }
  const weeks = [], dailyEmpty = [];
  let empty = 0, minS = S;
  for (let day = 0; day < 364; day++) {
    let mImp = 1, mLoc = 1, dem = 1;
    for (const s of SHOCKS) {
      if (day < s.from || day >= s.to) continue;
      if (s.imports) mImp *= s.imports;
      if (s.local) mLoc *= s.local;
      if (s.surge) dem = surge;
    }
    if (diversify && day >= 30) mImp = 1 - (1 - mImp) * 0.45;
    let imp = importCap, loc = localCap;
    if (p('local') === 2) { const g = Math.min(day / 240, 1) * 0.20; loc = 0.08 + g; imp = importCap - g; }
    let waste = wasteBase;
    if (p('waste') === 2) waste = wasteBase - 0.09 * Math.min(day / 60, 1);
    const eat = eatBase * dem;
    const order = Math.max(0, eatBase + waste + k * (target - S));
    const avail = imp * mImp + loc * mLoc;
    const inflow = Math.min(order, avail);
    let have = S + inflow;
    const eaten = Math.min(eat, have); have -= eaten;
    const wasted = Math.min(waste, have); have -= wasted;
    S = Math.min(have, cap);
    if (eat - eaten > 0.02) empty++;
    if (S < minS) minS = S;
    if (day % 7 === 6) weeks.push(S);
  }
  return { weeks, empty, minS, cap };
}

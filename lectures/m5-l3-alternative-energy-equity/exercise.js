/* Class Exercise 16 slides inside the Lecture 16 deck: solar pros and cons, who gets the benefits, justice check, and the data center answer.
   Same save ids as the standalone exercise deck (m5-s3: solar-choice, justice-rule, justice-check, data-center-answer). Teaching numbers only. */
import { $, $$, say, esc } from '../m5-l2-fews-nexus-energy/lecture.js?v=2026-10-21';

export function initExercise(live, ensureUser) {
const CHART = `<svg viewBox="0 0 560 300" width="560" height="300" role="img" aria-label="Line chart: savings reach what you paid at 5.6 years, or about 8 years with a lower sell-back rate">
<g stroke="#ddd" fill="none"><path d="M60 20V250H540M60 190H540M60 130H540M60 70H540"/></g>
<g font-size="16" fill="#555"><text x="8" y="256">$0</text><text x="8" y="196">$2k</text><text x="8" y="136">$4k</text><text x="8" y="76">$6k</text><text x="52" y="274">0</text><text x="172" y="274">3</text><text x="292" y="274">6</text><text x="412" y="274">9</text><text x="522" y="274">12 yrs</text></g>
<path d="M60 70H540" stroke="#222" stroke-width="3" fill="none" stroke-dasharray="8 6"/><text x="300" y="58" font-size="17" fill="#222">You paid $5,600 after the incentive</text>
<path d="M60 250L540 10" stroke="#2e7d5b" stroke-width="5" fill="none"/><circle cx="347" cy="70" r="11" fill="#e53b3b" stroke="#fff" stroke-width="3"/>
<path d="M60 250L540 130" stroke="#b3452c" stroke-width="5" fill="none"/>
<text x="352" y="110" font-size="18" fill="#e53b3b" font-weight="700">5.6 yrs</text><text x="360" y="200" font-size="18" fill="#b3452c" font-weight="700">Lower sell-back rate</text><text x="110" y="170" font-size="18" fill="#2e7d5b" font-weight="700">Savings at full rate</text></svg>`;
const SOL = [
  { id: 'sun', side: 'pro', i: 'sun', q: 'Sunshine: how much power can a Tempe roof make?', tag: 'Pro · Sunshine', img: 'sun', title: 'Arizona has about 350 sunny days a year',
    intro: 'More sun means more power from the same panels. A roof like this one can make more power than the home uses at midday.',
    boxes: [['Sunny days a year', '~350', 'Among the sunniest places in the country.'], ['Peak sun', 'Midday', 'Panels make the most power when the sun is high.'], ['But', '6 pm', 'Everyone wants power after work, when the sun is low. That is peak time.', 1]] },
  { id: 'bill', side: 'pro', i: 'coins', q: 'Bills: can solar lower what you pay each month?', tag: 'Pro · Bills', img: 'meter', title: 'Your own power means a smaller bill',
    intro: 'Power from your roof is power you do not buy from the utility.',
    boxes: [['Bill before solar', '$150', 'Per month, in this example.'], ['Bill after solar', '$65', 'Per month. You still buy power at night.'], ['You save', '~$1,000', 'About $1,000 a year.']] },
  { id: 'air', side: 'pro', i: 'gauge', q: 'Air: what happens to pollution?', tag: 'Pro · Cleaner air', img: 'leaf', title: 'Solar makes power without burning anything',
    intro: 'Some of Arizona’s power comes from burning gas and coal. Every unit your roof makes is a unit the power plant burns less of.',
    boxes: [['Panels make', 'No smoke', 'Nothing burns on your roof.'], ['Less burning means', 'Less smog', 'Cleaner air for the whole valley.'], ['Less burning also means', 'Less CO₂', 'Carbon dioxide is a gas that warms the planet.']] },
  { id: 'cost', side: 'con', i: 'coins', q: 'Cost: what does solar cost up front, and does an incentive help?', tag: 'Con · Cost and incentives', img: 'coins', title: 'Solar costs a lot up front. An incentive helps.',
    intro: 'An <b>incentive</b> is money the government gives back to help you buy solar.',
    boxes: [['Cost of panels', '$8,000', 'Paid before you save anything.'], ['Federal incentive', '−$2,400', '30% back. You pay <b>$5,600</b>.'], ['Barrier', 'Not for all', 'You need the money first, and a home you own.', 1]] },
  { id: 'be', side: 'con', i: 'chart', q: 'Break-even: how many years until solar pays for itself?', tag: 'Con · Break-even', title: 'How long until solar pays for itself?',
    intro: '<b>Break-even</b> is when your total savings equal what you paid. You paid <b>$5,600</b> after the incentive. Solar saves about <b>$1,000 a year</b>, so the green line crosses at <b>5.6 years</b>. Question: if you plan to move in 3 years, is solar worth it?', chart: CHART },
  { id: 'net', side: 'con', i: 'alert', q: 'Net metering: why does selling power pay less?', tag: 'Con · Net metering', img: 'pylon', title: 'Net metering: selling is worth less than buying',
    intro: '<b>Net metering</b> means your utility credits you for extra power your panels send to the grid.',
    boxes: [['Midday: you make extra', '6 <small>units</small>', 'You send them to the grid while you are at work.'], ['You buy at 6 pm', '14¢ <small>per unit</small>', 'Evening power costs you the full price.'], ['The utility credits you', '7¢ <small>per unit</small>', 'Only half. Break-even moves from <b>5.6</b> to about <b>8 years</b>.', 1]] },
  { id: 'rent', side: 'con', i: 'home', q: 'Renters: who cannot add panels?', tag: 'Con · Who can go solar', img: 'home', title: 'Not everyone can put panels on a roof',
    intro: 'Exercise 2 asks who gets the benefits. Start here.',
    boxes: [['Renters', 'No roof', 'You need your landlord to agree, and the roof is not yours.'], ['Shade or an old roof', 'Poor fit', 'Panels make less power, or the roof needs repair first.'], ['Money up front', '$5,600', 'Even after the incentive, many households cannot pay it.', 1]] },
];
const ric = n => `<svg aria-hidden="true" viewBox="0 0 24 24"><use href="#i-${n}"/></svg>`;
const picked = { pro: new Set(), con: new Set() };
const colHead = (t, c, x) => `<div class="col" style="left:${x}px;top:352px;color:${c}">${t}</div>`;
$('#cols').innerHTML = colHead('PROS', '#2e7d5b', 74) + colHead('CONS AND BARRIERS', '#b3452c', 560)
  + SOL.map(o => { const n = SOL.filter(x => x.side === o.side).indexOf(o); return `<button type="button" class="p" data-open="${o.id}" style="left:${o.side === 'pro' ? 74 : 560}px;top:${400 + n * 100}px;width:${o.side === 'pro' ? 420 : 440}px">${esc(o.q)}<span class="ic" data-ic="${o.id}">${ric(o.i)}</span></button>`; }).join('');
const popHtml = o => `<div class="pop" id="pop-${o.id}" role="dialog" aria-modal="true" aria-label="${esc(o.title)}">
  <button class="x" type="button" data-close aria-label="Close">${ric('x')}</button>
  ${o.img ? `<img class="cutp" src="img/${o.img}.png" alt="">` : ''}
  <div class="tag"><span class="ic">${ric(o.i)}</span>${esc(o.tag)}</div>
  <h3>${esc(o.title)}</h3>
  ${o.chart ? `<div class="two"><div><p>${o.intro}</p></div>${o.chart}</div>` : `<p>${o.intro}</p><div class="abc">${o.boxes.map(([l, v, d, w]) => `<div class="box${w ? ' warn' : ''}"><div class="l">${l}</div><div class="v">${v}</div><div class="d">${d}</div></div>`).join('')}</div>`}
  <div class="go"><button class="rbtn" type="button" data-add="${o.id}"></button><button class="rbtn g" type="button" data-close>Close</button></div></div>`;
const ansHtml = `<div class="pop" id="pop-answers" role="dialog" aria-modal="true" aria-label="Your answers">
  <button class="x" type="button" data-close aria-label="Close">${ric('x')}</button>
  <div class="tag"><span class="ic">${ric('pen')}</span>Your answers</div>
  <h3>Would you go solar?</h3>
  <p class="qn"><i>1</i>Would you put solar on your home?</p>
  <div class="rchips" id="go-solar"><button type="button" data-v="yes">Yes, go solar</button><button type="button" data-v="notyet">Not yet</button></div>
  <p class="qn"><i>2</i>Which barrier matters most to you?</p>
  <div class="rchips" id="barrier"><button type="button" data-v="cost">Up-front cost</button><button type="button" data-v="breakeven">Break-even years</button><button type="button" data-v="netmeter">Net metering</button><button type="button" data-v="renting">Not owning a roof</button></div>
  <div class="go"><button class="rbtn" type="button" id="pl-save">Submit</button><button class="rbtn g" type="button" data-close>Close</button><span class="status" id="pl-status"></span></div></div>`;
$('#pops').innerHTML = SOL.map(popHtml).join('') + ansHtml;
const plan = $('#plan');
function showPop(id) { if (id) refreshAdd(id); }
function refreshAdd(id) {
  const o = SOL.find(x => x.id === id); if (!o) return;
  const b = $(`[data-add="${id}"]`), on = picked[o.side].has(id);
  b.textContent = on ? `Remove from my ${o.side}s` : `Add to my ${o.side}s`;
}
function refreshCounts() {
  $('#n-pro').textContent = `${picked.pro.size} added`; $('#n-con').textContent = `${picked.con.size} added`;
  SOL.forEach(o => $(`[data-ic="${o.id}"]`).classList.toggle('done', picked[o.side].has(o.id)));
}
plan.addEventListener('click', e => {
  const ad = e.target.closest('[data-add]');
  if (ad) { const o = SOL.find(x => x.id === ad.dataset.add), set = picked[o.side]; set.has(o.id) ? set.delete(o.id) : set.add(o.id); refreshAdd(o.id); refreshCounts(); }
});
plan.addEventListener('ref:open', e => showPop(e.detail));
let goSolar = '', barrier = '';
$$('#go-solar button').forEach(b => b.addEventListener('click', () => { goSolar = b.dataset.v; $$('#go-solar button').forEach(x => x.classList.toggle('on', x === b)); }));
$$('#barrier button').forEach(b => b.addEventListener('click', () => { barrier = b.dataset.v; $$('#barrier button').forEach(x => x.classList.toggle('on', x === b)); }));
refreshCounts();

/* === EXERCISE 2: WHO GETS THE BENEFITS === scores 0 to 10, made-up */
const RULES = [
  { id: 'first', tag: 'Rule A', text: 'First come, first served: rebates for rooftop solar.', m: { bills: 8, air: 3, voice: 7 }, r: { bills: 2, air: 2, voice: 2 } },
  { id: 'equal', tag: 'Rule B', text: 'Every household gets the same rebate. Renters need their landlord to agree.', m: { bills: 6, air: 3, voice: 5 }, r: { bills: 3, air: 2, voice: 4 } },
  { id: 'target', tag: 'Rule C', text: 'Help the households with the highest energy bills first: free efficiency upgrades and shared clean power, planned with residents.', m: { bills: 4, air: 3, voice: 5 }, r: { bills: 8, air: 7, voice: 8 } },
  { id: 'farm', tag: 'Rule D', text: 'Build one big solar farm where land is cheapest, and let the utility decide.', m: { bills: 4, air: 3, voice: 1 }, r: { bills: 4, air: 6, voice: 1 } },
];
$('#rules').innerHTML = RULES.map(r => `<button type="button" class="rule" data-id="${r.id}"><b>${r.tag}</b>${esc(r.text)}</button>`).join('');
let rule = '';
function showRule() {
  const R = RULES.find(x => x.id === rule);
  $$('.rule').forEach(b => b.classList.toggle('on', b.dataset.id === rule));
  $$('.ngh .nb').forEach((nb, i) => {
    for (const k of ['bills', 'air', 'voice']) {
      const v = R ? (i ? R.r : R.m)[k] : 0;
      $(`[data-n="${k}"]`, nb).style.width = `${v * 10}%`;
      $(`[data-nv="${k}"]`, nb).textContent = R ? v : '·';
    }
  });
}
$$('.rule').forEach(b => b.addEventListener('click', () => { rule = b.dataset.id; showRule(); }));
showRule();

/* === EXERCISE 3: JUSTICE CHECK === */
const JQ = [
  ['Who benefits?', 'Do cheaper bills, cleaner air and jobs reach every neighborhood?'],
  ['Who carries the costs?', 'Does going solar avoid leaving the same groups with the pollution, higher bills or lost jobs, including fossil-fuel workers?'],
  ['Who has a say?', 'Were residents and workers asked, or only the people who run the system?'],
];
const ratings = {};
$('#jc').innerHTML = JQ.map(([t, d], i) => `<div class="jc-q" data-q="${i}"><div><b>${i + 1} · ${esc(t)}</b><span class="d">${esc(d)}</span></div><div class="chipsel"><button type="button" data-v="yes">Yes</button><button type="button" data-v="partly">Partly</button><button type="button" data-v="notyet">Not yet</button></div></div>`).join('');
$$('.jc-q').forEach(q => $$('button', q).forEach(b => b.addEventListener('click', () => { ratings[q.dataset.q] = b.dataset.v; $$('button', q).forEach(x => x.classList.toggle('on', x === b)); })));

/* === SAVE: SOLAR CHOICE === saves under m5-s3 as solar-choice */
$('#pl-save').addEventListener('click', async () => {
  const st = $('#pl-status');
  if (!picked.pro.size || !picked.con.size) { say(st, 'Read and add at least one pro and one con first.', 'err'); return; }
  if (!goSolar) { say(st, 'Answer question 1.', 'err'); return; }
  if (!barrier) { say(st, 'Answer question 2.', 'err'); return; }
  if (!await ensureUser(st)) return;
  try { await live.saveSim('solar-choice', { pros: [...picked.pro], cons: [...picked.con], decision: goSolar, barrier }); say(st, 'Submitted. Thanks!', 'ok'); }
  catch (e) { say(st, e.message, 'err'); }
});

/* === SAVE: DATA CENTER QUESTION === saves under m5-s3 as data-center-answer */
$('#dc-hint-btn').addEventListener('click', () => {
  const h = $('#dc-hint'), b = $('#dc-hint-btn');
  h.hidden = !h.hidden; b.textContent = h.hidden ? 'Show a hint' : 'Hide the hint'; b.setAttribute('aria-expanded', String(!h.hidden));
});
$('#dc-save').addEventListener('click', async () => {
  const st = $('#dc-status'), answer = $('#dc-text').value.trim().slice(0, 500);
  if (!answer) { say(st, 'Type your answer first.', 'err'); return; }
  if (!await ensureUser(st)) return;
  try { await live.saveSim('data-center-answer', { answer }); say(st, 'Submitted. Thanks!', 'ok'); }
  catch (e) { say(st, e.message, 'err'); }
});

/* === SAVE: WHO GETS THE BENEFITS === saves under m5-s3 as justice-rule */
$('#ru-save').addEventListener('click', async () => {
  const st = $('#ru-status');
  const left = $('#ru-left').value.trim().slice(0, 500), add = $('#ru-add').value.trim().slice(0, 500);
  if (!rule) { say(st, 'Choose a rule first.', 'err'); return; }
  if (!left || !add) { say(st, 'Answer both questions.', 'err'); return; }
  if (!await ensureUser(st)) return;
  try { await live.saveSim('justice-rule', { rule, left, add }); say(st, 'Submitted. Thanks!', 'ok'); }
  catch (e) { say(st, e.message, 'err'); }
});

/* === SAVE: JUSTICE CHECK === saves under m5-s3 as justice-check */
$('#jc-save').addEventListener('click', async () => {
  const st = $('#jc-status');
  const fix = $('#jc-fix').value.trim().slice(0, 600);
  if (Object.keys(ratings).length < JQ.length) { say(st, 'Rate all three questions.', 'err'); return; }
  if (!fix) { say(st, 'Write one change first.', 'err'); return; }
  if (!await ensureUser(st)) return;
  try { await live.saveSim('justice-check', { benefits: ratings[0], costs: ratings[1], voice: ratings[2], fix }); say(st, 'Submitted. Thanks!', 'ok'); }
  catch (e) { say(st, e.message, 'err'); }
});
}

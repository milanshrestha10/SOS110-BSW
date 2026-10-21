/* Class Exercise 15 (supply and demand in the energy shift): charts, pros and cons board and explain-the-shift builder.
   Teaching numbers only; saves under m5-s2 as fuel-weighin and supply-demand-shift. */
import { $, $$, say, esc } from './lecture.js?v=2026-10-21';

export function initExercise(live, ensureUser) {
  /* === MARKET CHART === schematic supply and demand lines.
     Demand: price = 9 - (quantity - sd). Supply: price = 1 + (quantity - ss).
     sd and ss slide the curves right (+) or left (-). All numbers are teaching numbers. */
  let uid = 0;
  const eq = ({ sd, ss }) => ({ q: (8 + sd + ss) / 2, p: 5 + (sd - ss) / 2 });
  const $m = n => `$${n.toFixed(2)}`;
  function market(svg, { nums = false, qmax = 16, pmax = 16 } = {}) {
    const [, , W, H] = svg.getAttribute('viewBox').split(' ').map(Number);
    const L = nums ? 92 : 60, R = W - 24, T = 24, B = H - (nums ? 70 : 62);
    const sx = q => L + q / qmax * (R - L), sy = p => B - p / pmax * (B - T);
    const id = `clip${++uid}`;
    const ticks = nums ? Array.from({ length: 8 }, (_, i) => i * 2 + 2).map(v =>
      `<line class="tk" x1="${L}" x2="${R}" y1="${sy(v)}" y2="${sy(v)}"/><text x="${L - 12}" y="${sy(v) + 7}" text-anchor="end">$${v}</text><text x="${sx(v)}" y="${B + 28}" text-anchor="middle">${v}</text>`).join('') : '';
    svg.innerHTML = `<defs><clipPath id="${id}"><rect x="${L}" y="${T}" width="${R - L}" height="${B - T}"/></clipPath></defs>
      ${ticks}<path class="ax" d="M${L} ${T - 6}V${B}H${R + 8}"/>
      <text class="al" x="${(L + R) / 2}" y="${H - 10}" text-anchor="middle">${nums ? 'Natural gas sold (teaching units)' : 'Quantity'}</text>
      <text class="al" transform="translate(${nums ? 24 : 22} ${(T + B) / 2}) rotate(-90)" text-anchor="middle">${nums ? 'Price ($ per MMBtu)' : 'Price'}</text>
      <g clip-path="url(#${id})"><line class="ln d g" data-k="gd"/><line class="ln s g" data-k="gs"/><line class="ln d" data-k="d"/><line class="ln s" data-k="s"/></g>
      <text class="lb d" data-k="dl">D</text><text class="lb s" data-k="sl">S</text>
      <g data-k="pr" style="display:none"><line class="pl" data-k="pline"/><line class="gap" data-k="gapl"/><text class="gapt" data-k="gapt"></text><circle class="pd" r="11" data-k="pd1"/><circle class="pd" r="11" data-k="pd2"/></g>
      <g data-k="eqg"><line class="gd" data-k="eqx"/><line class="gd" data-k="eqy"/><circle class="eq" r="14" data-k="eqd"/><text class="eqt" data-k="eqt"></text></g>`;
    const g = k => svg.querySelector(`[data-k="${k}"]`);
    const set = (k, o) => { const e = g(k); for (const a in o) e.setAttribute(a, typeof o[a] === 'number' ? o[a].toFixed(1) : o[a]); return e; };
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    function line(k, intercept, sign, off) { // price = intercept + sign * quantity
      set(k, { x1: sx(0), y1: sy(intercept), x2: sx(qmax), y2: sy(intercept + sign * qmax) });
    }
    return {
      render(st, { price = null, ghost = true } = {}) {
        line('d', 9 + st.sd, -1); line('s', 1 - st.ss, 1);
        line('gd', 9, -1); line('gs', 1, 1);
        svg.querySelectorAll('.g').forEach(e => { e.style.display = ghost && (st.sd || st.ss) ? '' : 'none'; });
        const dq = clamp(1.2, 0, qmax), sq = clamp(13 + st.ss, 2, 14.5);
        set('dl', { x: sx(dq) + 12, y: sy(9 + st.sd - dq) - 14 });
        set('sl', { x: sx(sq) + 12, y: clamp(sy(1 + sq - st.ss), T + 30, B) + 36 });
        const e = eq(st), ex = sx(e.q), ey = sy(e.p);
        set('eqd', { cx: ex, cy: ey });
        set('eqx', { x1: ex, x2: ex, y1: ey, y2: B }); set('eqy', { x1: L, x2: ex, y1: ey, y2: ey });
        const t = g('eqt'); t.textContent = nums ? `${$m(e.p)} · ${e.q}` : ''; set('eqt', { x: ex + 22, y: ey + 40 });
        const pr = g('pr'); pr.style.display = price === null ? 'none' : '';
        if (price !== null) {
          const qd = Math.max(0, 9 + st.sd - price), qs = Math.max(0, price - 1 + st.ss), py = sy(price);
          set('pline', { x1: L, x2: R, y1: py, y2: py });
          set('pd1', { cx: sx(qd), cy: py }); set('pd2', { cx: sx(qs), cy: py });
          const gy = py;
          set('gapl', { x1: sx(Math.min(qd, qs)), x2: sx(Math.max(qd, qs)), y1: gy, y2: gy });
          g('gapt').textContent = Math.abs(qd - qs) < .05 ? 'Balanced' : `${qd > qs ? 'Shortage' : 'Surplus'} ${Math.abs(qd - qs)}`;
          set('gapt', { x: (sx(qd) + sx(qs)) / 2, y: gy - 16 });
        }
      },
    };
  }
  /* Slide both curves toward a new state; calls draw(state) every frame. */
  function tween(st, to, draw, ms = 700) {
    const from = { sd: st.sd, ss: st.ss }, t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      st.sd = from.sd + (to.sd - from.sd) * e; st.ss = from.ss + (to.ss - from.ss) * e;
      draw();
      if (k < 1) requestAnimationFrame(step);
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { Object.assign(st, to); draw(); } else requestAnimationFrame(step);
  }
  const arrow = (a, b) => Math.abs(b - a) < .05 ? '•' : b > a ? '▲' : '▼';

  /* === EXERCISE 1: HOW IT WORKS === */
  const m1 = market($('#mk1'), { nums: true });
  const S1 = { sd: 0, ss: 0, price: 8 };
  let last = eq(S1), note1 = 'Slide the price. Where the gap closes, the market is balanced.';
  function draw1() {
    m1.render(S1, { price: S1.price });
    $('#mk-pv').textContent = $m(S1.price);
    const qd = Math.max(0, 9 + S1.sd - S1.price), qs = Math.max(0, S1.price - 1 + S1.ss);
    const e = eq(S1);
    const gap = qd === qs ? 'At this price, buyers and sellers match.'
      : qd > qs ? `At ${$m(S1.price)} buyers want <b>${qd}</b> but sellers offer only <b>${qs}</b>: a <b>shortage</b>. Prices tend to rise.`
      : `At ${$m(S1.price)} buyers want <b>${qd}</b> but sellers offer <b>${qs}</b>: a <b>surplus</b>. Prices tend to fall.`;
    $('#mk-read').innerHTML = `${gap}<br><span style="display:block;margin-top:10px">Market price: <b>${$m(e.p)}</b> · Sold: <b>${e.q}</b></span><span style="display:block;margin-top:6px;color:var(--mute);font-size:21px">${note1}</span>`;
  }
  $('#mk-p').addEventListener('input', e => { S1.price = +e.target.value; draw1(); });
  const EVENT = {
    'd+': 'Demand shifts right: more buyers at every price.',
    'd-': 'Demand shifts left: fewer buyers at every price.',
    's+': 'Supply shifts right: sellers offer more at every price.',
    's-': 'Supply shifts left: sellers offer less at every price.',
  };
  $$('[data-act]').forEach(b => b.addEventListener('click', () => {
    const a = b.dataset.act, before = eq(S1), to = { sd: S1.sd, ss: S1.ss };
    if (a === 'reset') { to.sd = 0; to.ss = 0; note1 = 'Back to the start.'; }
    else if (a === 'settle') { S1.price = eq(S1).p; $('#mk-p').value = S1.price; draw1(); return; }
    else {
      const k = a[0] === 'd' ? 'sd' : 'ss', v = to[k] + (a[1] === '+' ? 2 : -2);
      if (Math.abs(v) > 4) { note1 = 'That is as far as this chart goes. Press Reset to start over.'; draw1(); return; }
      to[k] = v;
      const after = eq(to);
      note1 = `${EVENT[a]} Price ${$m(before.p)} → ${$m(after.p)} ${arrow(before.p, after.p)}. Sold ${before.q} → ${after.q} ${arrow(before.q, after.q)}.`;
    }
    tween(S1, to, draw1);
    if (a === 'reset') { S1.price = 8; $('#mk-p').value = 8; }
  }));
  draw1();

  /* === EXERCISE 2: PROS AND CONS === cards are marked in the browser, then saved with Submit */
  const CARDS = [
    ['c1', 'coal', 'The US has large coal reserves, and plants can keep a big pile of fuel on site.'],
    ['c2', 'coal', 'Burning coal puts more CO₂ into the air than burning natural gas for the same energy.'],
    ['c3', 'coal', 'Burning coal also releases soot, sulfur dioxide and mercury.'],
    ['c4', 'coal', 'Coal mining gives jobs to mining towns, but surface mines strip away the land.'],
    ['g1', 'gas', 'Burning natural gas puts less CO₂ into the air than coal for the same energy.'],
    ['g2', 'gas', 'Natural gas is mostly methane (CH₄), a strong greenhouse gas that can leak from wells and pipes.'],
    ['g3', 'gas', 'Gas plants can speed up and slow down fast, which helps back up wind and solar.'],
    ['g4', 'gas', 'CNG buses and trucks have cleaner tailpipes than diesel, but need special tanks and fueling stations.'],
    ['g5', 'gas', 'Gas prices can swing a lot from year to year.'],
  ];
  const marks = {};
  for (const [id, fuel, text] of CARDS) {
    $(`#pc-${fuel}`).insertAdjacentHTML('beforeend', `<div class="pc-card" data-id="${id}"><p>${esc(text)}</p><div class="pc-chips"><button type="button" data-v="pro">Pro</button><button type="button" data-v="con">Con</button><button type="button" data-v="both">It depends</button></div></div>`);
  }
  $$('.pc-card').forEach(card => $$('button', card).forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.v, on = card.dataset.m !== v;
    if (on) { card.dataset.m = v; marks[card.dataset.id] = v; } else { delete card.dataset.m; delete marks[card.dataset.id]; }
    $$('button', card).forEach(x => x.classList.toggle('on', on && x === b));
  })));

  /* === EXERCISE 3: EXPLAIN THE SHIFT === each step moves one curve once the student picks it */
  const MK = { gas: market($('#mk-gas')), coal: market($('#mk-coal')) };
  const MS = { gas: { sd: 0, ss: 0 }, coal: { sd: 0, ss: 0 } };
  const STEPS = [
    { m: 'gas', ans: 's+', to: { ss: 3 }, ev: 'New drilling methods, hydraulic fracturing and horizontal drilling, make it cheaper to get gas out of shale rock.',
      hint: 'Cheaper to produce changes what sellers offer at each price. That is supply, not demand.',
      out: 'Gas supply shifts right: more gas is offered at every price. The gas price falls and more gas is sold.' },
    { m: 'coal', ans: 'd-', to: { sd: -3 }, ev: 'Power plants can burn coal or gas, so they are substitutes. Gas now costs less, so plant owners buy less coal.',
      hint: 'Buyers are changing how much they want at each price. That is demand. Do they want more coal or less?',
      out: 'Coal demand shifts left: buyers want less coal at every price. The coal price and the amount sold both fall.' },
    { m: 'gas', ans: 'd+', to: { sd: 2 }, ev: 'Power companies build more gas plants, and cities such as Tempe buy CNG buses instead of diesel buses. More buyers want gas.',
      hint: 'More buyers wanting gas is a change in demand. Which way does it move?',
      out: 'Gas demand shifts right, so gas sales grow again and the price recovers part of the way. Each CNG bus also means less diesel, a petroleum product, so petroleum loses a customer too.' },
    { m: 'coal', ans: 's-', to: { ss: -2 }, ev: 'The easy coal is used up. Mines must dig deeper and restore the land, so each ton costs more to produce.',
      hint: 'Higher production costs change what sellers offer at each price. That is supply. More or less coal offered?',
      out: 'Coal supply shifts left. Coal costs more, so the price rises, but even less coal is sold.' },
  ];
  const LABEL = { 's+': 'Supply increases', 's-': 'Supply decreases', 'd+': 'Demand increases', 'd-': 'Demand decreases' };
  let step = 0, firstTry = STEPS.map(() => true), picked = STEPS.map(() => ''), done = STEPS.map(() => false);
  function drawMk(m) { MK[m].render(MS[m]); }
  function showStep() {
    const s = STEPS[step];
    $('#sd-cap').innerHTML = `<b>Step ${step + 1} of ${STEPS.length} · ${s.m === 'gas' ? 'Natural gas' : 'Coal'} market.</b> ${esc(s.ev)}`;
    $$('#sd-pick button').forEach(b => {
      b.disabled = done[step]; b.className = 'btn ghost';
      if (done[step] && b.dataset.a === s.ans) b.classList.add('right');
    });
    $('#sd-out').textContent = done[step] ? s.out : '';
    $('#sd-next').disabled = !done[step];
    $('#sd-next').textContent = step === STEPS.length - 1 ? 'Finish' : 'Next step';
    $('#sd-prev').disabled = step === 0;
    ['gas', 'coal'].forEach(m => $(`#pn-${m}`).classList.toggle('live', m === s.m));
  }
  $$('#sd-pick button').forEach(b => b.addEventListener('click', () => {
    const s = STEPS[step], a = b.dataset.a;
    picked[step] += (picked[step] ? ',' : '') + a;
    if (a !== s.ans) {
      firstTry[step] = false; b.classList.add('wrong');
      $('#sd-out').textContent = `Not quite. ${s.hint}`;
      return;
    }
    done[step] = true;
    const before = eq(MS[s.m]), to = { sd: MS[s.m].sd, ss: MS[s.m].ss, ...s.to }, after = eq(to);
    tween(MS[s.m], to, () => drawMk(s.m));
    $(`#chg-${s.m}`).innerHTML = `Price <span class="ar">${arrow(before.p, after.p)}</span> · Amount sold <span class="ar">${arrow(before.q, after.q)}</span>`;
    showStep();
  }));
  $('#sd-next').addEventListener('click', () => {
    if (step < STEPS.length - 1) { step++; showStep(); } else $('#sd-end').hidden = false;
  });
  $('#sd-prev').addEventListener('click', () => { if (step > 0) { step--; showStep(); } });
  drawMk('gas'); drawMk('coal'); showStep();

  /* === SAVE: PROS AND CONS === saves under m5-s2 as fuel-weighin */
  $('#pc-save').addEventListener('click', async () => {
    const st = $('#pc-status');
    if (Object.keys(marks).length < CARDS.length) { say(st, 'Mark every card first.', 'err'); return; }
    if (!await ensureUser(st)) return;
    try { await live.saveSim('fuel-weighin', { marks }); say(st, 'Submitted. Thanks!', 'ok'); }
    catch (e) { say(st, e.message, 'err'); }
  });

  /* === SAVE: EXPLAIN THE SHIFT === saves under m5-s2 as supply-demand-shift */
  $('#sd-save').addEventListener('click', async () => {
    const st = $('#sd-status');
    const why = $('#sd-why').value.trim().slice(0, 800);
    if (!why) { say(st, 'Write your explanation first.', 'err'); return; }
    if (!await ensureUser(st)) return;
    const right = firstTry.filter(Boolean).length;
    try { await live.saveSim('supply-demand-shift', { right, tries: picked.map(p => p.split(',').filter(Boolean).length), why }); say(st, `Submitted: ${right} of ${STEPS.length} right on the first try.`, 'ok'); }
    catch (e) { say(st, e.message, 'err'); }
  });
}

/* Lecture 14 helpers: flip cards, tap-to-reveal questions and small DOM utilities. */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const say = (el, msg, kind = '') => { if (el) { el.textContent = msg; el.className = `status ${kind}`; } };
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* === FLIP CARDS === front: term and definition. back: example. */
export const flipCard = ({ term, definition, example, significance, back = 'Example', hint = 'Tap for example', when = '' }, icon = '', cls = '') => `
  <div class="vcard${cls ? ' ' + cls : ''}" tabindex="0" role="button" aria-label="${esc(term)}: show more">
    <div class="in">
      <div class="f">${when ? `<div class="when">${when === ' ' ? '&nbsp;' : esc(when)}</div>` : ''}<h4${icon ? ' class="ih"' : ''}>${icon}${esc(term)}</h4>${definition}<span class="hint">${esc(hint)}</span></div>
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

/* === TEN-MINUTE TIMER === start, pause and reset a countdown shown in the element with id `clock` */
export function timer(clock, btn, reset, total = 600) {
  let left = total, id = 0;
  const show = () => {
    clock.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    clock.classList.toggle('low', left <= 60);
  };
  const stop = () => { clearInterval(id); id = 0; btn.textContent = left === 0 || left === total ? 'Start' : 'Resume'; };
  btn.addEventListener('click', () => {
    if (id) { stop(); return; }
    if (left === 0) left = total;
    btn.textContent = 'Pause';
    id = setInterval(() => { left -= 1; show(); if (left <= 0) { left = 0; show(); stop(); btn.textContent = 'Start'; } }, 1000);
  });
  reset.addEventListener('click', () => { clearInterval(id); id = 0; left = total; show(); btn.textContent = 'Start'; });
  show();
}

/* === BURGER EXERCISE === the form on the class exercise slide */
export const BURGERS = { beef: 'Beef burger', whopper: 'Plant-based Whopper', veggie: 'Vegetarian burger', impossible: 'Impossible Burger' };
export function burgerForm() {
  return {
    read() {
      const topics = $$('.topics input:checked').map(i => i.value);
      const data = {
        burger: $('#bx-burger').value,
        pros: $('#bx-pros').value.trim().slice(0, 600),
        cons: $('#bx-cons').value.trim().slice(0, 600),
        topics,
        vegan: $('#bx-vegan').value.trim().slice(0, 400),
      };
      const need = [['burger', 1], ['pros', 2], ['cons', 3], ['vegan', 5]].find(([k]) => !data[k]);
      return { data, missing: need ? need[1] : 0 };
    },
  };
}

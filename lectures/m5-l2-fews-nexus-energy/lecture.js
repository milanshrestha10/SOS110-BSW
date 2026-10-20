/* Lecture 15 helpers: flip cards, tap-to-reveal questions and small DOM utilities. */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const say = (el, msg, kind = '') => { if (el) { el.textContent = msg; el.className = `status ${kind}`; } };
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* === FLIP CARDS === front: term and definition. back: example. */
export const flipCard = ({ term, definition, example, significance, back = 'Example', hint = 'Tap for example', when = '' }, icon = '', cls = '') => `
  <div class="vcard${cls ? ' ' + cls : ''}" tabindex="0" role="button" aria-label="${esc(term)}: show more">
    <div class="in">
      <div class="f">${when ? `<div class="when">${esc(when)}</div>` : ''}<h4${icon ? ' class="ih"' : ''}>${icon}${esc(term)}</h4>${definition}<span class="hint">${esc(hint)}</span></div>
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

/* === SVG helpers === */
export const NS = 'http://www.w3.org/2000/svg';
export const pathOf = (pts, x, y) => pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('');

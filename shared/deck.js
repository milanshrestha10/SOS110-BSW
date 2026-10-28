/* ===========================================
   SOS110 DECK: fixed 1920x1080 stage + navigation
   Side and bottom buttons, arrow keys / Space / PageUp-Down / Home / End,
   swipe on touch;
   the #n hash remembers the slide. Fires "deck:slide" on document.
   The instructor's presenter view (on the admin site) can follow and steer the
   deck through postMessage; ?embed hides the buttons for its slide previews.
   =========================================== */
(function () {
  const stage = document.getElementById('deckStage');
  const slides = Array.from(stage.querySelectorAll('.slide'));
  let current = 0;
  /* Only the admin site may steer the deck. The deck sends it nothing but slide numbers. */
  const PRESENTER = ['https://sos110-ce7a1.web.app', 'https://sos110-ce7a1.firebaseapp.com', 'http://localhost:5000'];
  const embed = new URLSearchParams(location.search).has('embed');
  if (embed) document.body.classList.add('deck-embed');

  /* === SCALE === the whole stage scales uniformly to fit the window */
  function scale() {
    const f = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `translate(${(innerWidth - 1920 * f) / 2}px,${(innerHeight - 1080 * f) / 2}px) scale(${f})`;
  }
  scale();
  addEventListener('resize', scale);

  /* === CHROME === progress bar, side flip buttons and a bottom pager, all outside the stage */
  const bar = document.createElement('div');
  bar.className = 'deck-progress';
  document.body.appendChild(bar);
  const chev = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const LEFT = chev('M15 5l-7 7 7 7'), RIGHT = chev('M9 5l7 7-7 7');
  const side = document.createElement('div');
  side.className = 'deck-side';
  side.innerHTML = `<button type="button" class="prev" data-go="-1" aria-label="Previous slide">${LEFT}<small>Back</small></button>`
    + `<button type="button" class="next" data-go="1" aria-label="Next slide">${RIGHT}<small>Next</small></button>`;
  document.body.appendChild(side);
  const ctl = document.createElement('nav');
  ctl.className = 'deck-controls';
  ctl.setAttribute('aria-label', 'Slide navigation');
  ctl.innerHTML = `<button type="button" data-go="-1" aria-label="Previous slide">${LEFT}</button><span></span><button type="button" data-go="1" aria-label="Next slide">${RIGHT}</button>`;
  document.body.appendChild(ctl);
  [side, ctl].forEach(el => el.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { go(current + Number(b.dataset.go)); b.blur(); } }));

  /* Buttons fade out after the pointer rests, so they never sit on a projected slide */
  let idle;
  const wake = () => { document.body.classList.remove('deck-idle'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('deck-idle'), 2500); };
  ['mousemove', 'pointerdown', 'touchstart'].forEach(t => addEventListener(t, wake, { passive: true }));
  wake();

  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, n) => { if (n !== i) s.classList.remove('active', 'visible'); });
    const s = slides[i];
    s.classList.add('active');
    requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add('visible')));
    current = i;
    bar.style.width = `${((i + 1) / slides.length) * 100}%`;
    ctl.querySelector('span').textContent = `${i + 1} / ${slides.length}`;
    [side, ctl].forEach(el => { el.querySelector('[data-go="-1"]').disabled = i === 0; el.querySelector('[data-go="1"]').disabled = i === slides.length - 1; });
    if (location.hash !== `#${i + 1}`) history.replaceState(null, '', `#${i + 1}`);
    document.dispatchEvent(new CustomEvent('deck:slide', { detail: { index: i, slide: s } }));
    tell();
  }

  /* === PRESENTER LINK === an audience window opened by the presenter view reports its slide */
  function tell() {
    if (embed || !window.opener) return;
    PRESENTER.forEach(o => { try { window.opener.postMessage({ sos110: 'slide', index: current, count: slides.length }, o); } catch (e) { /* opener gone */ } });
  }
  addEventListener('message', e => {
    if (!PRESENTER.includes(e.origin) || !e.data || e.data.sos110 !== 'go') return;
    const i = Number(e.data.index);
    if (Number.isInteger(i) && i !== current) go(i); else if (e.data.hello) tell();
  });

  /* === KEYBOARD === ignored while typing or using a slider */
  addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(current + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(current - 1); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(slides.length - 1);
  });

  /* === SWIPE === horizontal swipes on touch screens */
  let x0 = null;
  addEventListener('touchstart', e => { if (!e.target.closest('input, button, .vcard')) x0 = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
  });

  /* === REFERENCE-GUIDE PANELS === on a .slide.ref, [data-open="NAME"] shows .pop#pop-NAME and adds "open" to
     the slide; [data-close], the .shade or Esc closes it. The slide gets a "ref:open" event (detail = NAME or '') */
  function refShow(slide, id) {
    slide.querySelectorAll('.pop').forEach(p => p.classList.toggle('on', p.id === 'pop-' + id));
    slide.classList.toggle('open', !!id);
    slide.dispatchEvent(new CustomEvent('ref:open', { detail: id }));
  }
  stage.addEventListener('click', e => {
    const slide = e.target.closest('.slide.ref'); if (!slide) return;
    const op = e.target.closest('[data-open]');
    if (op) refShow(slide, op.dataset.open);
    else if (e.target.closest('[data-close]') || e.target.classList.contains('shade')) refShow(slide, '');
  });
  addEventListener('keydown', e => {
    const slide = stage.querySelector('.slide.ref.open');
    if (e.key === 'Escape' && slide) { refShow(slide, ''); e.stopImmediatePropagation(); }
  }, true);

  /* === SHARED ICONS === sprite for the reference-guide system; a page's own symbol with the same id wins.
     i-search: tap for more information. i-data: facts and indicators. i-doc: write and submit an answer. */
  (function () {
    const S = {
      x: '<path d="M18 6 6 18M6 6l12 12"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.9-4.9"/><path d="M10.5 8v5M8 10.5h5"/>',
      data: '<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7.5" y="12" width="3" height="5.5"/><rect x="12.5" y="8" width="3" height="9.5"/><rect x="17.5" y="5" width="3" height="12.5"/>',
      doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M8.5 12h7M8.5 15.5h4"/><path d="m16 19.5 3.2-3.2 1.3 1.3-3.2 3.2-1.8.5Z"/>'
    };
    const have = id => document.getElementById(id);
    const sym = Object.keys(S).filter(k => !have('i-' + k)).map(k => `<symbol id="i-${k}" viewBox="0 0 24 24">${S[k]}</symbol>`).join('');
    if (sym) document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${sym}</svg>`);
  })();

  /* Mark a submit button as sent: Deck.sent(button, 'Submitted') */
  function sent(btn, label) { btn.classList.add('sent'); if (label) { const t = btn.querySelector('span') || btn; t.textContent = label; } }

  window.Deck = { go, sent, get index() { return current; }, slides };
  go((parseInt(location.hash.slice(1), 10) || 1) - 1);
})();

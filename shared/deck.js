/* ===========================================
   SOS110 DECK: fixed 1920x1080 stage + navigation
   Side and bottom buttons, arrow keys / Space / PageUp-Down / Home / End,
   swipe on touch;
   the #n hash remembers the slide. Fires "deck:slide" on document.
   =========================================== */
(function () {
  const stage = document.getElementById('deckStage');
  const slides = Array.from(stage.querySelectorAll('.slide'));
  let current = 0;

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
  }

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

  window.Deck = { go, get index() { return current; }, slides };
  go((parseInt(location.hash.slice(1), 10) || 1) - 1);
})();

/* ===========================================
   SOS110 PACE: the instructor decides how far students can go in a class exercise deck.
   The instructor's Pace page (admin site) writes to the lecture record:
     lectures/{id}.pace.{deck} = { open: N, answers: ['poll-id', ...] }
       open     highest slide number students may see (1-based). Missing = no limit.
       answers  quiz questions whose "Show answer" has been released.
   Students only read it. The lecture record is already readable by signed-in students and
   writable only by the admin (firebase/firestore.rules), so no rule changes are needed.
   Usage on a deck page, after connect():  import { initPace } from '../../shared/pace.js';  initPace(live, 'm5-l3-exercises');
   =========================================== */
export function initPace(live, deck) {
  const forced = new URLSearchParams(location.search).has('student'); // test the student view while signed in as admin
  if (new URLSearchParams(location.search).has('embed')) return;
  if (live.isAdmin() && !forced) return;
  const D = window.Deck;
  if (!D) return;
  let answers = [];
  let bypass = false;
  const done = new Set();

  const note = btn => {
    let n = btn.parentElement.querySelector('.pace-note');
    if (!n) { n = document.createElement('span'); n.className = 'pace-note'; btn.after(n); }
    return n;
  };

  /* "Show answer" stays locked until the instructor releases it. Capture phase: runs before the deck's own handler. */
  document.addEventListener('click', e => {
    const b = e.target.closest?.('[data-reveal]');
    if (!b || bypass || answers === null) return;
    if (!answers.includes(b.dataset.reveal)) {
      e.stopImmediatePropagation(); e.preventDefault();
      note(b).textContent = 'Your instructor will show the answer after the class talks it over.';
    }
  }, true);

  const reveal = id => {
    document.querySelectorAll(`[data-reveal="${id}"]`).forEach(b => { bypass = true; try { b.click(); } finally { bypass = false; } const n = b.parentElement.querySelector('.pace-note'); if (n) n.remove(); });
  };

  live.onLecture(lec => {
    const p = lec?.pace?.[deck];
    if (!p) { answers = null; D.setLimit(null); return; } // pacing not started: everything open
    answers = Array.isArray(p.answers) ? p.answers : [];
    D.setLimit(Math.max(1, Number(p.open) || 1) - 1);
    answers.filter(id => !done.has(id)).forEach(id => { done.add(id); reveal(id); });
  });
}

/* ===========================================
   SOS110 ACCESS CODE BADGE: shows today's attendance code in the top right corner of a class
   exercise deck, so the instructor can leave it on the projector.
   The code lives in lectures/{id}/private/code, which only the instructor can read
   (firebase/firestore.rules), so students never see it. Where the code comes from:
     1. ?code=ABCD in the deck link (the instructor's link to the student deck can carry it), or
     2. the instructor's own signed-in session (live.isAdmin()) reading the private record.
   With neither, nothing is shown. Hidden in ?embed previews.
   Usage on a deck page, after connect():  import { initCodeBadge } from '../../shared/code-badge.js';  initCodeBadge(live);
   =========================================== */
export async function initCodeBadge(live) {
  const q = new URLSearchParams(location.search);
  if (q.has('embed') || q.has('student')) return;
  let code = (q.get('code') || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{3,12}$/.test(code)) code = '';
  if (!code && live.isAdmin()) { try { code = (await live.getCode()) || ''; } catch { /* not readable: show nothing */ } }
  if (!code) return;
  const el = document.createElement('div');
  el.className = 'code-badge';
  el.setAttribute('aria-label', `Today's access code ${code}`);
  el.innerHTML = '<small>Access code</small><b></b>';
  el.querySelector('b').textContent = code;
  document.body.appendChild(el);
}

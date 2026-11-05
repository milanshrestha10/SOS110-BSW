/* ===========================================
   SOS110 SAVE UNTIL CLASS ENDS: students can keep editing their answers until class is over.
   "End of class" is decided in two ways, whichever comes first:
     1. The instructor closes the exercise: lectures/{id}.pace.{deck}.closed = true (Firebase console or Pace page).
     2. Automatic: CLASS_MS (3 hours) after this student first started the exercise on this device.
   Students only read the lecture record, so no Firestore rule change is needed. The lock is in the page
   (the same trust level as the pace control), the sims rules already allow a student to overwrite their own answer.
   Usage:  const cls = classWindow(live, 'm6-l2-exercises', LECTURE);  cls.onChange(closed => ...);  cls.start();
   Drafts: const d = draftStore(key);  d.get() / d.set(obj)
   =========================================== */
export const CLASS_MS = 3 * 60 * 60 * 1000;

export function classWindow(live, deck, lectureId) {
  const KEY = `sos110-started:${lectureId}:${deck}`;
  let closedByInstructor = false, listeners = [], last = null;
  const startedAt = () => { try { return Number(localStorage.getItem(KEY)) || 0; } catch { return 0; } };
  const isClosed = () => closedByInstructor || (startedAt() > 0 && Date.now() - startedAt() > CLASS_MS);
  const fire = () => { const c = isClosed(); if (c !== last) { last = c; listeners.forEach(f => f(c)); } };
  if (!new URLSearchParams(location.search).has('embed')) {
    live.onLecture?.(lec => { closedByInstructor = !!lec?.pace?.[deck]?.closed && !(live.isAdmin() && !new URLSearchParams(location.search).has('student')); fire(); });
  }
  setInterval(fire, 30000);
  return {
    isClosed,
    /* call when the student first types or answers; remembers when their class window began */
    start() { if (!startedAt()) { try { localStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ } } },
    /* a record saved on another device can set the start time too */
    adopt(ms) { if (ms && !startedAt()) { try { localStorage.setItem(KEY, String(ms)); } catch { /* ignore */ } fire(); } },
    startedAt,
    onChange(f) { listeners.push(f); f(isClosed()); last = isClosed(); },
  };
}

export function draftStore(key) {
  return {
    get() { try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; } },
    set(v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch { return false; } },
  };
}

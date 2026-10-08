/* ===========================================
   SOS110 COURSE DATA
   Fills lecture pages from course/course.json so the sessions, objectives,
   assignments and glossary are written once. Elements opt in with
   data-fill="<name>"; see fill() below for the names.
   Pages must be served over http(s) (GitHub Pages, or `python3 -m http.server`
   locally); browsers block fetch() from file:// pages.
   =========================================== */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function loadSession(sessionId, courseUrl = '../../course/course.json') {
  const course = await (await fetch(courseUrl)).json();
  const all = course.modules.flatMap(m => m.sessions.map((s, i) => ({ ...s, n: i + 1, module: m })));
  const i = all.findIndex(s => s.id === sessionId);
  if (i < 0) throw new Error(`Unknown session ${sessionId}`);
  const s = all[i];
  const gloss = course.glossary.find(g => g.module === s.module.glossary_module);
  const terms = s.terms.map(t => gloss.terms.find(g => g.term === t));
  return { course, session: s, next: all[i + 1], terms };
}

export function fill(root, { session: s, next, terms }) {
  const put = (name, html) => root.querySelectorAll(`[data-fill="${name}"]`).forEach(el => { el.innerHTML = html; });
  put('module-title', esc(s.module.title));
  put('module-num', s.module.module);
  put('lecture-num', s.n);
  put('reading', esc(s.readings || 'No reading'));
  put('topic', esc(s.topic));
  put('due', esc(s.due || 'Nothing due today'));
  put('chips', terms.map(t => `<span class="chip">${esc(t.term)}</span>`).join(' '));
  put('objectives', s.module.objectives.map(o => `<li>${esc(o)}</li>`).join(''));
  put('assessments', s.module.assessments.map(a => `<li>${esc(a)}</li>`).join(''));
  put('next', next ? `${esc(next.topic)}${next.due ? ` <span class="mute">(due: ${esc(next.due)})</span>` : ''}` : 'End of course');
  put('vocab', terms.map(t => `
    <div class="vcard" tabindex="0" role="button" aria-label="${esc(t.term)}: show example">
      <div class="in">
        <div class="f"><h4>${esc(t.term)}</h4><p>${esc(t.definition)}</p><span class="hint">Tap for example</span></div>
        <div class="b"><h4>Example</h4><p>${esc(t.example)}</p><p style="margin-top:14px;opacity:.85"><b>Why it matters:</b> ${esc(t.significance)}</p></div>
      </div>
    </div>`).join(''));
  root.querySelectorAll('.vcard').forEach(c => {
    if (c._wired) return;
    c._wired = true;
    const flip = () => c.classList.toggle('flip');
    c.addEventListener('click', flip);
    c.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); flip(); } });
  });
}

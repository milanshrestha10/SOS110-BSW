/* ===========================================
   SOS110 LIVE: attendance, polls and simulation results
   One API, two back ends:
   - Firebase (Firestore; students check in anonymously with a name and email,
     the instructor signs in with Google) when shared/firebase-config.js has a config
   - Demo mode otherwise: data lives in this browser's localStorage, and open tabs
     stay in sync, so the student and admin pages can be tried side by side.

   Firestore layout (see firebase/firestore.rules):
     lectures/{id}                    { openPoll }             readable by signed-in users
     lectures/{id}/private/code       { code }                 admin only
     lectures/{id}/attendance/{uid}   { name, email, code, at }
     lectures/{id}/votes/{poll}__{uid}{ poll, choice, uid, at }
     lectures/{id}/sims/{sim}__{uid}  { sim, uid, name, data, at }
   =========================================== */
import { firebaseConfig, adminEmails } from './firebase-config.js';

/* Students check in with just a name and email (no account). The profile is
   remembered in this browser; in Firebase mode it rides on an anonymous
   sign-in so each browser gets its own uid. */
const PROFILE = 'sos110-student';
const readProfile = () => { try { return JSON.parse(localStorage.getItem(PROFILE)); } catch { return null; } };
function saveProfile(name, email) {
  name = String(name || '').trim(); email = String(email || '').trim().toLowerCase();
  if (!name) throw new Error('Enter your full name.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Enter a valid email address.');
  if (name.length > 120 || email.length > 120) throw new Error('Name and email must be under 120 characters.');
  const p = { name, email };
  try { localStorage.setItem(PROFILE, JSON.stringify(p)); } catch { /* storage blocked */ }
  return p;
}

const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';

export async function connect(lectureId) {
  return firebaseConfig ? firebaseBackend(lectureId) : demoBackend(lectureId);
}

/* === DEMO BACK END === */
function demoBackend(lectureId) {
  const KEY = `sos110-demo:${lectureId}`;
  const store = {
    read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } },
    write(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* storage blocked */ } emit(); },
  };
  const subs = new Set();
  function emit() { const d = store.read(); subs.forEach(fn => fn(d)); }
  addEventListener('storage', e => { if (e.key === KEY) emit(); });
  const watch = pick => cb => { const fn = d => cb(pick(d)); subs.add(fn); fn(store.read()); return () => subs.delete(fn); };
  const update = fn => { const d = store.read(); fn(d); store.write(d); };

  let me = null;
  try { me = JSON.parse(localStorage.getItem('sos110-demo-user')); } catch { /* ignore */ }
  if (me && !me.email) me = null; // profile from before email was collected

  return {
    mode: 'demo',
    user: () => me,
    isAdmin: () => true,
    async signIn(name, email) {
      const p = saveProfile(name, email);
      me = { uid: me?.uid || crypto.randomUUID(), ...p };
      try { localStorage.setItem('sos110-demo-user', JSON.stringify(me)); } catch { /* ignore */ }
      return me;
    },
    async signOut() { me = null; try { localStorage.removeItem('sos110-demo-user'); } catch { /* ignore */ } },
    onLecture: watch(d => d.lecture || {}),
    async checkIn(code) {
      if (!me) throw new Error('Check in on the attendance slide first.');
      const want = (store.read().lecture || {}).code;
      if (want && want.toUpperCase() !== String(code).trim().toUpperCase()) throw new Error('That code does not match the one on screen.');
      update(d => { (d.attendance ||= {})[me.uid] = { name: me.name, email: me.email, at: Date.now() }; });
    },
    async vote(poll, choice) {
      if (!me) throw new Error('Check in on the attendance slide first.');
      update(d => { (d.votes ||= {})[`${poll}__${me.uid}`] = { poll, choice, uid: me.uid, at: Date.now() }; });
    },
    async saveSim(sim, data) {
      if (!me) throw new Error('Check in on the attendance slide first.');
      update(d => { (d.sims ||= {})[`${sim}__${me.uid}`] = { sim, uid: me.uid, name: me.name, data, at: Date.now() }; });
    },
    /* admin */
    async setLecture(patch) { update(d => { d.lecture = { ...(d.lecture || {}), ...patch }; }); },
    async getCode() { return (store.read().lecture || {}).code || ''; },
    onAttendance: watch(d => Object.entries(d.attendance || {}).map(([uid, v]) => ({ uid, ...v }))),
    onVotes: watch(d => Object.values(d.votes || {})),
    onSims: watch(d => Object.values(d.sims || {})),
    async reset() { store.write({}); },
  };
}

/* === FIREBASE BACK END === */
async function firebaseBackend(lectureId) {
  const [{ initializeApp }, auth, fs] = await Promise.all([
    import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-firestore.js'),
  ]);
  const app = initializeApp(firebaseConfig);
  const a = auth.getAuth(app);
  const db = fs.getFirestore(app);
  const lecRef = fs.doc(db, 'lectures', lectureId);
  const col = name => fs.collection(db, 'lectures', lectureId, name);
  const toUser = u => {
    if (!u) return null;
    if (!u.isAnonymous) return { uid: u.uid, name: u.displayName || u.email, email: u.email };
    const p = readProfile();
    return p ? { uid: u.uid, ...p } : null;
  };
  let me = toUser(a.currentUser);
  await new Promise(r => { const off = auth.onAuthStateChanged(a, u => { me = toUser(u); off(); r(); }); });
  const need = () => { if (!me) throw new Error('Check in on the attendance slide first.'); };
  const list = (name, cb) => fs.onSnapshot(col(name), s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), () => cb([]));

  return {
    mode: 'firebase',
    user: () => me,
    isAdmin: () => !!me && adminEmails.includes(me.email),
    async signIn(name, email) {
      const p = saveProfile(name, email);
      const u = a.currentUser || (await auth.signInAnonymously(a)).user;
      me = { uid: u.uid, ...p };
      return me;
    },
    async signOut() { await auth.signOut(a); me = null; },
    onLecture: cb => fs.onSnapshot(lecRef, s => cb(s.data() || {}), () => cb({})),
    async checkIn(code) {
      need();
      try {
        await fs.setDoc(fs.doc(col('attendance'), me.uid), { name: me.name, email: me.email, code: String(code).trim().toUpperCase(), at: fs.serverTimestamp() });
      } catch { throw new Error('That code does not match the one on screen.'); }
    },
    async vote(poll, choice) { need(); await fs.setDoc(fs.doc(col('votes'), `${poll}__${me.uid}`), { poll, choice, uid: me.uid, at: fs.serverTimestamp() }); },
    async saveSim(sim, data) { need(); await fs.setDoc(fs.doc(col('sims'), `${sim}__${me.uid}`), { sim, uid: me.uid, name: me.name, data, at: fs.serverTimestamp() }); },
    /* admin */
    async setLecture(patch) {
      const { code, ...rest } = patch;
      if (code !== undefined) await fs.setDoc(fs.doc(db, 'lectures', lectureId, 'private', 'code'), { code });
      if (Object.keys(rest).length) await fs.setDoc(lecRef, rest, { merge: true });
    },
    async getCode() { const s = await fs.getDoc(fs.doc(db, 'lectures', lectureId, 'private', 'code')); return s.data()?.code || ''; },
    onAttendance: cb => list('attendance', cb),
    onVotes: cb => list('votes', cb),
    onSims: cb => list('sims', cb),
    async reset() { throw new Error('Clear results in the Firebase console.'); },
  };
}

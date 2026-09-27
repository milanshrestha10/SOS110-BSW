/* ===========================================
   FIREBASE SETTINGS
   Leave firebaseConfig as null to run every lecture in demo mode:
   attendance, polls and simulation results then stay in this browser only.

   To go live: create a Firebase project, add a Web app, turn on
   Authentication > Google and Cloud Firestore, paste the web app config
   below, and deploy firebase/firestore.rules with the same admin email.
   These values are safe to publish; the security rules protect the data.
   =========================================== */
export const firebaseConfig = null;
/* e.g. { apiKey: '...', authDomain: 'sos110.firebaseapp.com', projectId: 'sos110', appId: '...' } */

/* Accounts allowed to open admin pages and read class results. */
export const adminEmails = ['mshrest1@asu.edu'];

/* Only accounts in this Google Workspace domain may sign in as students. */
export const studentDomain = 'asu.edu';

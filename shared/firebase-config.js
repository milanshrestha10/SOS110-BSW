/* ===========================================
   FIREBASE SETTINGS
   Leave firebaseConfig as null to run every lecture in demo mode:
   attendance, polls and simulation results then stay in this browser only.

   To go live: create a Firebase project, add a Web app, turn on
   Authentication > Google (instructor) and Anonymous (students), and Cloud Firestore, paste the web app config
   below, and deploy firebase/firestore.rules with the same admin email.
   These values are safe to publish; the security rules protect the data.
   =========================================== */
export const firebaseConfig = {
  apiKey: 'AIzaSyAtkC1Ttu2xgUzqdA2AFiQzTu-SO3PoS8o',
  authDomain: 'sos110-ce7a1.firebaseapp.com',
  projectId: 'sos110-ce7a1',
  storageBucket: 'sos110-ce7a1.firebasestorage.app',
  messagingSenderId: '430440408501',
  appId: '1:430440408501:web:ee74e85788159571b825fc'
};

/* Accounts allowed to open admin pages and read class results. */
export const adminEmails = ['mshrest1@asu.edu'];


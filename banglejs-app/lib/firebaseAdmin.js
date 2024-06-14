import admin from 'firebase-admin';
import serviceAccount from '../firebase-key.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://tiilt-banglejs.firebaseio.com' 
  });
}

const db = admin.firestore();

export { db };
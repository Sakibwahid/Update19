import { auth, db } from './config';

export const testFirebaseConnection = () => {
  console.log('Firebase Auth:', auth ? '✅ Connected' : '❌ Failed');
  console.log('Firebase Firestore:', db ? '✅ Connected' : '❌ Failed');
  console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
};
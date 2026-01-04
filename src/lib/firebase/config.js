// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC1-tCmJHa2pkfmaWrC45ToaTzIDZkhWnk",
  authDomain: "auction19-f259d.firebaseapp.com",
  projectId: "auction19-f259d",
  storageBucket: "auction19-f259d.firebasestorage.app",
  messagingSenderId: "652902959670",
  appId: "1:652902959670:web:319342e952929a53872697",
  measurementId: "G-BVPRTNZF4F"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

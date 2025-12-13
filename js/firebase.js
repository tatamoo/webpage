// js/firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDes2PpNExneb_nr5G_aT2KmB3pwWhY83M",
  authDomain: "computer-92f25.firebaseapp.com",
  projectId: "computer-92f25",
  storageBucket: "computer-92f25.firebasestorage.app",
  messagingSenderId: "376599013841",
  appId: "1:376599013841:web:f14625a5952bf28fa358f0",
  measurementId: "G-KEK2HX8DRR"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

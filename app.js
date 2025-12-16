
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { signup, signin, signout } from './auth.js';
import { saveNote, loadNotes } from './notes.js';

const firebaseConfig = {
  apiKey: "AIzaSyDes2PpNExneb_nr5G_aT2KmB3pwWhY83M",
  authDomain: "computer-92f25.firebaseapp.com",
  projectId: "computer-92f25",
  storageBucket: "computer-92f25.firebasestorage.app",
  messagingSenderId: "376599013841",
  appId: "1:376599013841:web:f14625a5952bf28fa358f0",
  measurementId: "G-KEK2HX8DRR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI Elements
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const signupBtn = document.getElementById('signupBtn');
const signinBtn = document.getElementById('signinBtn');
const signoutBtn = document.getElementById('signoutBtn');
const titleEl = document.getElementById('title');
const contentEl = document.getElementById('content');
const saveBtn = document.getElementById('saveBtn');
const refreshBtn = document.getElementById('refreshBtn');
const notesList = document.getElementById('notesList');

// 가입 버튼
signupBtn.addEventListener('click', () => {
  signup(auth, emailEl.value.trim(), passwordEl.value);
});

// 로그인 버튼
signinBtn.addEventListener('click', async () => {
  await signin(auth, emailEl.value.trim(), passwordEl.value);
  passwordEl.value = '';
});

// 로그아웃 버튼
signoutBtn.addEventListener('click', () => {
  signout(auth);
});

// 저장 버튼
saveBtn.addEventListener('click', async () => {
  const success = await saveNote(auth, db, titleEl.value, contentEl.value);
  if(success) { // 성공 시, 입력칸 초기화 및 메모 목록 업데이트
    titleEl.value = '';
    contentEl.value = '';
    loadNotes(auth, db, notesList);
  }
});

// 초기화 버튼
refreshBtn.addEventListener('click', () => {
  loadNotes(auth, db, notesList);
});

// 로그인 시, 화면 업데이트
onAuthStateChanged(auth, user => {
  const authPane = document.getElementById('authPane');
  const welcomePane = document.getElementById('welcomePane');
  const welcomeText = document.getElementById('welcomeText');
  const editor = document.getElementById('editor');

  if (user) { // 로그인 성공
    authPane.style.display = 'none'; // 로그인 폼 삭제
    welcomePane.style.display = 'block';
    welcomeText.textContent = `안녕하세요, ${user.email}님!`;
    editor.style.display = 'block';
    loadNotes(auth, db, notesList);
  } else {
    authPane.style.display = 'block'; // 로그인 폼 유지
    welcomePane.style.display = 'none';
    editor.style.display = 'none';
    notesList.innerHTML = '로그인이 필요합니다';
  }
});

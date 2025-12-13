// js/notes.js
import { db, auth } from './firebase.js';
import { encryptAES, decryptAES } from './crypto.js';
import {
  collection, addDoc, query, where,
  getDocs, serverTimestamp, deleteDoc, doc
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

export async function saveNote(title, content, password) {
  const user = auth.currentUser;
  if (!user) return;

  const encrypted = await encryptAES(password, content);

  await addDoc(collection(db, 'notes'), {
    ownerUid: user.uid,
    title,
    content: encrypted,
    createdAt: serverTimestamp()
  });
}

export async function loadNotes(password, notesList) {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, 'notes'), where('ownerUid', '==', user.uid));
  const snap = await getDocs(q);

  let html = '';
  for (const d of snap.docs) {
    const data = d.data();
    const plain = await decryptAES(password, data.content);

    html += `
      <div class="note">
        <strong>${data.title}</strong>
        <div>${plain}</div>
      </div>`;
  }

  notesList.innerHTML = html || 'No notes';
}

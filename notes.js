// notes.js - 노트 관리 모듈

import { collection, addDoc, query, where, getDocs, serverTimestamp, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { encryptText, decryptText } from './crypto.js';
import { userEncryptionKey } from './auth.js';

function escapeHtml(s){ 
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); 
}

export async function saveNote(auth, db, title, content) {
  console.log('저장 버튼 클릭, userEncryptionKey:', userEncryptionKey ? 'YES' : 'NO');
  const user = auth.currentUser;
  if(!user){alert('not signed in');return false}
  if(!userEncryptionKey){alert('encryption key not available');return false}
  
  try{
    const encTitle = await encryptText(title || 'Untitled', userEncryptionKey);
    const encContent = await encryptText(content || '', userEncryptionKey);
    
    await addDoc(collection(db,'notes'),{ 
      ownerUid:user.uid, 
      title: encTitle, 
      content: encContent, 
      createdAt: serverTimestamp() 
    });
    
    return true;
  }catch(e){
    console.error(e);
    alert('Error saving: '+e.message);
    return false;
  }
}

export async function loadNotes(auth, db, notesList) {
  const user = auth.currentUser;
  if(!user){notesList.innerHTML='Sign in to view notes'; return}
  
  if(!userEncryptionKey){
    notesList.innerHTML='Please log out and log in again to view encrypted notes';
    return;
  }
  
  notesList.innerHTML='Loading...';
  const q = query(collection(db,'notes'), where('ownerUid','==',user.uid));
  const snap = await getDocs(q);
  
  if(snap.empty){notesList.innerHTML='No notes yet'; return}
  
  let html='';
  for(const d of snap.docs){
    const data = d.data();
    try{
      const decTitle = await decryptText(data.title, userEncryptionKey);
      const decContent = await decryptText(data.content, userEncryptionKey);
      html += `<div class="note"><strong>${escapeHtml(decTitle)}</strong>
               <div style="margin-top:6px">${escapeHtml(decContent)}</div>
               <div style="margin-top:8px"><button data-id="${d.id}" class="delBtn" style="background:#ef4444">Delete</button></div>
               </div>`;
    }catch(e){
      html += `<div class="note" style="background:#fee2e2"><strong>⚠️ Decryption Failed</strong>
               <div style="margin-top:6px;color:#991b1b">Data may be corrupted or tampered with</div>
               <div style="margin-top:8px"><button data-id="${d.id}" class="delBtn" style="background:#ef4444">Delete</button></div>
               </div>`;
    }
  }
  
  notesList.innerHTML = html;
  
  document.querySelectorAll('.delBtn').forEach(btn=>btn.addEventListener('click', async e=>{
    const id = e.currentTarget.getAttribute('data-id');
    if(!confirm('Delete this note?')) return;
    await deleteDoc(doc(db,'notes',id)); 
    loadNotes(auth, db, notesList);
  }));
}
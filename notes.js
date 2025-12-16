
import { collection, addDoc, query, where, getDocs, serverTimestamp, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { encryptText, decryptText } from './crypto.js';
import { userEncryptionKey } from './auth.js';

// HTML 특수문자 이스케이프 -> 태그로 해석되는 것을 방지
function escapeHtml(s){ 
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;'); 
}

// 메모 저장
export async function saveNote(auth, db, title, content) {
  console.log('저장 버튼 클릭, userEncryptionKey:', userEncryptionKey ? 'YES' : 'NO');
  const user = auth.currentUser;
  if(!user){
    alert('not signed in');
    return false;
  }

  if(!userEncryptionKey){
    alert('encryption key not available');
    return false;
  }
  
  try{
    const encTitle = await encryptText(title || 'Untitled', userEncryptionKey); // 암호화한 제목
    const encContent = await encryptText(content || '', userEncryptionKey); // 암호화한 내용
    
    // 메모 firebase에 저장
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

// 메모 불러오기
export async function loadNotes(auth, db, notesList) {
  const user = auth.currentUser;
  if(!user){
    notesList.innerHTML='로그인이 필요합니다.'; 
    return;
  }
  
  if(!userEncryptionKey){
    notesList.innerHTML='다시 로그인하세요.';
    return;
  }
  
  notesList.innerHTML='로딩중...';
  const q = query(collection(db,'notes'), where('ownerUid','==',user.uid));
  const snap = await getDocs(q);
  
  if(snap.empty){notesList.innerHTML='메모가 없습니다.'; return}
  
  let html='';
  for(const d of snap.docs){
    const data = d.data();
    try{
      const decTitle = await decryptText(data.title, userEncryptionKey); // 복호화한 제목
      const decContent = await decryptText(data.content, userEncryptionKey); // 복호화한 내용
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

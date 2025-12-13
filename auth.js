// auth.js - Firebase 인증 관리 모듈

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

export let userEncryptionKey = null;

export function setEncryptionKey(key) {
  userEncryptionKey = key;
}

export function clearEncryptionKey() {
  userEncryptionKey = null;
}

export async function signup(auth, email, password) {
  if(!email||!password){alert('fill email & password');return}
  try{ 
    await createUserWithEmailAndPassword(auth, email, password);
    userEncryptionKey = password;
    alert('Signed up successfully!');
  }
  catch(e){console.error(e);alert(e.message)}
}

export async function signin(auth, email, password) {
  if(!email||!password){alert('fill email & password');return}
  userEncryptionKey = password;
  console.log('로그인 시도, userEncryptionKey 설정됨:', userEncryptionKey ? 'YES' : 'NO');
  try{ 
    await signInWithEmailAndPassword(auth, email, password);
    console.log('로그인 성공, userEncryptionKey:', userEncryptionKey ? 'YES' : 'NO');
  }
  catch(e){
    console.error(e);
    alert(e.message);
    userEncryptionKey = null;
  }
}

export async function signout(auth) {
  await signOut(auth);
  userEncryptionKey = null;
}

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

export let userEncryptionKey = null; // 사용자 암호화 키

// 사용자 암호화 키 생성
export function setEncryptionKey(key) {
  userEncryptionKey = key;
}

// 사용자 암호화 키 삭제
export function clearEncryptionKey() {
  userEncryptionKey = null;
}

// 가입 동작
export async function signup(auth, email, password) {
  if(!email){
    alert('아이디를 입력해주세요.');
    return;
  }
  else if(!password){
    alert('비밀번호를 입력해주세요.');
    return;
  }

  try{ 
    await createUserWithEmailAndPassword(auth, email, password);
    userEncryptionKey = password; // 사용자의 비밀번호를 기반으로 암호화 키 생성
    alert('가입이 완료되었습니다!');
  }
  catch(e){console.error(e);
    if(e.message=="Firebase: Error (auth/email-already-in-use)."){
      alert("이미 존재하는 아이디입니다.");
    }
    else if(e.message=="Firebase: Error (auth/invalid-email)."){
      alert("이메일 형태로 입력하십시오.");
    }
    else if(e.message=="Firebase: Password should be at least 6 characters (auth/weak-password)."){
      alert("비밀번호는 최소 6자 이상으로 입력하십시오.");
    }
    else
      alert(e.message);
  }
}

// 로그인 동작
export async function signin(auth, email, password) {
  if(!email){
    alert('아이디를 입력해주세요.');
    return;
  }
  else if(!password){
    alert('비밀번호를 입력해주세요.');
    return;
  }

  userEncryptionKey = password; // 사용자의 비밀번호를 기반으로 암호화 키 생성
  console.log('로그인 시도, userEncryptionKey 설정됨:', userEncryptionKey ? 'YES' : 'NO');
  try{ 
    await signInWithEmailAndPassword(auth, email, password);
    console.log('로그인 성공, userEncryptionKey:', userEncryptionKey ? 'YES' : 'NO');
  }
  catch(e){
    console.error(e);
    alert("아이디 또는 비밀번호가 잘못 되었습니다.");
    userEncryptionKey = null;
  }
}

// 로그아웃 동작
export async function signout(auth) {
  await signOut(auth);
  userEncryptionKey = null; // 사용자의 암호화 키 초기화
}

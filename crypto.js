
// 비밀번호 기반 비밀키 생성
async function makeKey(password) {
  const enc = new TextEncoder();

  // 비밀번호 → SHA-256 해시 (항상 32바이트)
  const hash = await crypto.subtle.digest(
    "SHA-256",
    enc.encode(password)
  );

  return await crypto.subtle.importKey(
    "raw",                      // 원본 데이터
    hash,                        // 256비트 해시
    { name: "AES-GCM" },         // AES-GCM 방식(AES의 라운드 연산)
    false,                       // 키를 외부로 꺼낼 수 없음
    ["encrypt", "decrypt"]       // 암호화 / 복호화용
  );
}

// AES 암호화
export async function encryptText(text, password) {

  
  const iv = crypto.getRandomValues(new Uint8Array(12)); // AES에서 사용할 랜덤 iv 생성
  const key = await makeKey(password); // 비밀번호로 비밀키 생성
  const enc = new TextEncoder();

  // AES의 라운드 연산(SubBytes, ShiftRows, MixColumns)
  const encrypted = await crypto.subtle.encrypt( 
    { name: "AES-GCM", iv },     // AES 방식 + iv
    key,                         // 비밀키
    enc.encode(text)             // 평문 → 바이트
  );

  // iv + 암호문을 하나로 합침
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv, 0);                          // 앞: iv
  result.set(new Uint8Array(encrypted), iv.length); // 뒤: 암호문

  // Base64 문자열로 변환
  return btoa(String.fromCharCode(...result));
}


// AES 복호화
export async function decryptText(encryptedBase64, password) {

  const data = Uint8Array.from( // Base64 → 바이트 배열
    atob(encryptedBase64),
    c => c.charCodeAt(0)
  );

  
  const iv = data.slice(0, 12); // 앞 12바이트: iv  
  const encrypted = data.slice(12); // 나머지: 암호문
  const key = await makeKey(password); // 같은 비밀번호로 키 다시 생성

  // AES 역 라운드 연산 수행
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  );

  // 바이트 → 문자열
  return new TextDecoder().decode(decrypted);
}

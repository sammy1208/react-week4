import { scrypt } from "scrypt-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

function hexToBytes(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
}

export async function decryptContent(encText: string) {
  const [ivHex, dataHex] = encText.split(":");

  const iv = hexToBytes(ivHex);
  const encrypted = hexToBytes(dataHex);

  // 🔥 前端用 scrypt-js 衍生 key（對應 Node 的 scryptSync）
  const key = await scrypt(
    new TextEncoder().encode(SECRET_KEY),
    new TextEncoder().encode("salt"),
    16384,
    8,
    1,
    32
  ); // key length = 32

  // Node.js 回傳的是 number[] → 要強制轉 Uint8Array
  const keyBytes = Uint8Array.from(key);

  // 導入 key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  // 解密
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

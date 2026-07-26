import { scrypt } from "scrypt-js";
import { EncryptedContent, EncryptedContentV2 } from "../types/theme";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export class NovelDecryptionError extends Error {
  constructor() {
    super("小說密碼錯誤或加密內容已損毀");
    this.name = "NovelDecryptionError";
  }
}

function hexToBytes(hex: string) {
  if (!hex || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) {
    throw new NovelDecryptionError();
  }

  return Uint8Array.from(
    hex.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)),
  );
}

function base64ToBytes(base64: string) {
  try {
    const binary = window.atob(base64);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    throw new NovelDecryptionError();
  }
}

function concatBytes(...arrays: Uint8Array[]) {
  const result = new Uint8Array(
    arrays.reduce((total, array) => total + array.length, 0),
  );
  let offset = 0;

  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }

  return result;
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  N: number,
  r: number,
  p: number,
  keyLength: number,
) {
  const key = await scrypt(
    textEncoder.encode(password),
    salt,
    N,
    r,
    p,
    keyLength,
  );

  return Uint8Array.from(key);
}

function isV2Payload(content: EncryptedContent): content is EncryptedContentV2 {
  return (
    typeof content === "object" &&
    content !== null &&
    content.version === 2 &&
    content.algorithm === "AES-256-GCM" &&
    content.kdf?.name === "scrypt" &&
    content.kdf.N === 16384 &&
    content.kdf.r === 8 &&
    content.kdf.p === 1 &&
    content.kdf.keyLength === 32 &&
    typeof content.kdf.salt === "string" &&
    typeof content.iv === "string" &&
    typeof content.ciphertext === "string" &&
    typeof content.authTag === "string"
  );
}

async function decryptV2(payload: EncryptedContentV2, password: string) {
  const salt = base64ToBytes(payload.kdf.salt);
  const iv = base64ToBytes(payload.iv);
  const ciphertext = base64ToBytes(payload.ciphertext);
  const authTag = base64ToBytes(payload.authTag);
  if (salt.length !== 16 || iv.length !== 12 || authTag.length !== 16) {
    throw new NovelDecryptionError();
  }
  const keyBytes = await deriveKey(
    password,
    salt,
    payload.kdf.N,
    payload.kdf.r,
    payload.kdf.p,
    payload.kdf.keyLength,
  );
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    cryptoKey,
    concatBytes(ciphertext, authTag),
  );

  return textDecoder.decode(decrypted);
}

async function decryptLegacy(content: string, password: string) {
  const [ivHex, dataHex, ...unexpected] = content.split(":");
  if (!ivHex || !dataHex || unexpected.length > 0) {
    throw new NovelDecryptionError();
  }

  const keyBytes = await deriveKey(
    password,
    textEncoder.encode("salt"),
    16384,
    8,
    1,
    32,
  );
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["decrypt"],
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: hexToBytes(ivHex) },
    cryptoKey,
    hexToBytes(dataHex),
  );

  return textDecoder.decode(decrypted);
}

export async function decryptContent(
  content: EncryptedContent,
  password: string,
) {
  if (!password) throw new NovelDecryptionError();

  try {
    if (isV2Payload(content)) {
      return await decryptV2(content, password);
    }

    if (typeof content === "string") {
      return await decryptLegacy(content, password);
    }

    throw new NovelDecryptionError();
  } catch (error) {
    if (error instanceof NovelDecryptionError) throw error;
    throw new NovelDecryptionError();
  }
}

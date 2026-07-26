const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config({ quiet: true });

const rootDir = path.resolve(__dirname, "..");
const sourceDataDir = path.join(rootDir, "src", "data");
const sourceNovelsDir = path.join(rootDir, "src", "novels");
const publicDataDir = path.join(rootDir, "public", "data", "novels");
const publicEncryptedDir = path.join(rootDir, "public", "novels", "encrypted");
const accessVerifierPath = path.join(
  rootDir,
  "public",
  "security",
  "novel-access.json",
);
const encryptionCachePath = path.join(
  rootDir,
  ".cache",
  "novel-encryption-manifest.json",
);
const ACCESS_VERIFIER_ID = "novel-reader-access";
const ACCESS_SENTINEL = "novel-reader-access-v1";
const ENCRYPTION_CACHE_VERSION = 1;

const password = process.env.NOVEL_ENCRYPTION_PASSWORD;

const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  keyLength: 32,
};

if (!password) {
  console.error(
    "找不到加密密碼。請在 .env 設定 NOVEL_ENCRYPTION_PASSWORD。",
  );
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function serializeJson(data) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function readEncryptionCache() {
  if (!fs.existsSync(encryptionCachePath)) {
    return { version: ENCRYPTION_CACHE_VERSION, entries: {} };
  }

  try {
    const cache = readJson(encryptionCachePath);
    if (
      cache.version === ENCRYPTION_CACHE_VERSION &&
      cache.entries &&
      typeof cache.entries === "object" &&
      !Array.isArray(cache.entries)
    ) {
      return cache;
    }
  } catch {
    // A missing or invalid cache is safe: existing ciphertext is verified below.
  }

  return { version: ENCRYPTION_CACHE_VERSION, entries: {} };
}

function cacheKeyFor(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

function canReuseFromHashCache(
  cacheEntry,
  encryptedPath,
  novelId,
  sourceHash,
) {
  if (
    !cacheEntry ||
    cacheEntry.novelId !== novelId ||
    cacheEntry.sourceHash !== sourceHash ||
    !fs.existsSync(encryptedPath)
  ) {
    return false;
  }

  return cacheEntry.outputHash === sha256(fs.readFileSync(encryptedPath));
}

function buildCacheEntry(encryptedPath, novelId, sourceHash) {
  return {
    novelId,
    sourceHash,
    outputHash: sha256(fs.readFileSync(encryptedPath)),
  };
}

function writeTextIfChanged(filePath, content) {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8") === content) {
    return false;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  fs.writeFileSync(temporaryPath, content, "utf8");
  fs.renameSync(temporaryPath, filePath);
  return true;
}

function safeFileName(value) {
  const cleaned = String(value)
    .normalize("NFKC")
    .replace(/\s+/g, "_")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .replace(/\.+$/g, "")
    .slice(0, 120);

  if (cleaned) return cleaned;

  return crypto.createHash("sha1").update(String(value)).digest("hex");
}

function deriveKey(secret, salt, params = SCRYPT_PARAMS) {
  return crypto.scryptSync(secret, salt, params.keyLength, {
    N: params.N,
    r: params.r,
    p: params.p,
    maxmem: 64 * 1024 * 1024,
  });
}

function encryptV2(plaintext) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(password, salt);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return {
    version: 2,
    algorithm: "AES-256-GCM",
    kdf: {
      name: "scrypt",
      salt: salt.toString("base64"),
      N: SCRYPT_PARAMS.N,
      r: SCRYPT_PARAMS.r,
      p: SCRYPT_PARAMS.p,
      keyLength: SCRYPT_PARAMS.keyLength,
    },
    iv: iv.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

function decryptV2(payload) {
  const salt = Buffer.from(payload.kdf.salt, "base64");
  const iv = Buffer.from(payload.iv, "base64");
  const ciphertext = Buffer.from(payload.ciphertext, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const key = deriveKey(password, salt, payload.kdf);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}

function isV2Payload(payload) {
  return (
    payload?.version === 2 &&
    payload.algorithm === "AES-256-GCM" &&
    payload.kdf?.name === "scrypt" &&
    typeof payload.kdf.salt === "string" &&
    typeof payload.iv === "string" &&
    typeof payload.ciphertext === "string" &&
    typeof payload.authTag === "string"
  );
}

function canReuseEncryptedFile(filePath, novelId, plaintext) {
  if (!fs.existsSync(filePath)) return false;

  try {
    const existing = readJson(filePath);
    if (existing.id !== novelId || !isV2Payload(existing.contentEnc)) {
      return false;
    }

    return decryptV2(existing.contentEnc) === plaintext;
  } catch {
    return false;
  }
}

function buildEncryptedNovel(novel, plaintext) {
  return {
    id: novel.id,
    contentEnc: encryptV2(plaintext),
  };
}

function main() {
  const counters = {
    unchanged: 0,
    hashMatched: 0,
    verified: 0,
    encrypted: 0,
    metadata: 0,
    missing: 0,
    accessVerifier: "unchanged",
  };
  const encryptionCache = readEncryptionCache();
  const nextCacheEntries = {};
  const accessVerifierIsValid = canReuseEncryptedFile(
    accessVerifierPath,
    ACCESS_VERIFIER_ID,
    ACCESS_SENTINEL,
  );

  if (!accessVerifierIsValid && fs.existsSync(accessVerifierPath)) {
    console.warn(
      "目前密碼無法解開入口驗證；視為密碼已更換，將重新加密全部文章。",
    );
  }

  const cpFiles = fs
    .readdirSync(sourceDataDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b, "zh-Hant"));

  console.log("開始產生 AES-256-GCM 小說資料……");

  for (const cpFile of cpFiles) {
    const sourceList = readJson(path.join(sourceDataDir, cpFile));
    const cpKey = path.basename(cpFile, ".json");
    const metadataList = [];

    for (const novel of sourceList) {
      const markdownPath = path.resolve(sourceNovelsDir, novel.file);
      const relativePath = path.relative(sourceNovelsDir, markdownPath);

      if (
        relativePath.startsWith("..") ||
        path.isAbsolute(relativePath) ||
        !fs.existsSync(markdownPath)
      ) {
        console.warn(`略過缺少的小說原文：${novel.file}`);
        counters.missing += 1;
        continue;
      }

      const markdown = fs.readFileSync(markdownPath, "utf8");
      const sourceHash = sha256(markdown);
      const fileName = `${safeFileName(novel.id)}.json`;
      const encryptedPath = path.join(publicEncryptedDir, cpKey, fileName);
      const cacheKey = cacheKeyFor(encryptedPath);
      const cacheEntry = encryptionCache.entries[cacheKey];

      if (
        accessVerifierIsValid &&
        canReuseFromHashCache(
          cacheEntry,
          encryptedPath,
          novel.id,
          sourceHash,
        )
      ) {
        counters.unchanged += 1;
        counters.hashMatched += 1;
      } else if (
        accessVerifierIsValid &&
        canReuseEncryptedFile(encryptedPath, novel.id, markdown)
      ) {
        counters.unchanged += 1;
        counters.verified += 1;
      } else {
        const output = serializeJson(buildEncryptedNovel(novel, markdown));
        writeTextIfChanged(encryptedPath, output);
        counters.encrypted += 1;
      }

      nextCacheEntries[cacheKey] = buildCacheEntry(
        encryptedPath,
        novel.id,
        sourceHash,
      );

      metadataList.push({
        id: novel.id,
        title: novel.title,
        author: novel.author,
        tags: novel.tags,
        description: novel.description,
        rating: novel.rating,
        contentPath: `novels/encrypted/${cpKey}/${encodeURIComponent(fileName)}`,
      });
    }

    const metadataPath = path.join(publicDataDir, cpFile);
    if (writeTextIfChanged(metadataPath, serializeJson(metadataList))) {
      counters.metadata += 1;
    }
  }

  if (!accessVerifierIsValid) {
    const verifier = buildEncryptedNovel(
      { id: ACCESS_VERIFIER_ID },
      ACCESS_SENTINEL,
    );
    writeTextIfChanged(accessVerifierPath, serializeJson(verifier));
    counters.accessVerifier = "updated";
  }

  writeTextIfChanged(
    encryptionCachePath,
    serializeJson({
      version: ENCRYPTION_CACHE_VERSION,
      entries: nextCacheEntries,
    }),
  );

  console.log(
    [
      "加密完成。",
      `新增或更新：${counters.encrypted}`,
      `內容未變：${counters.unchanged}`,
      `雜湊命中：${counters.hashMatched}`,
      `解密驗證：${counters.verified}`,
      `目錄更新：${counters.metadata}`,
      `缺少原文：${counters.missing}`,
      `入口驗證：${counters.accessVerifier}`,
    ].join(" "),
  );
}

main();

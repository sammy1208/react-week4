import { NovelsData } from "../types/theme";

const BASE_URL = import.meta.env.BASE_URL;

function assetUrl(path: string) {
  const cleanPath = path.replace(/^\/+/, "");
  return `${BASE_URL}${cleanPath}`;
}

export async function fetchNovelList(cpKey: string) {
  const res = await fetch(assetUrl(`data/novels/${encodeURIComponent(cpKey)}.json`));

  if (!res.ok) {
    throw new Error(`Novel list not found: ${cpKey}`);
  }

  return (await res.json()) as NovelsData[];
}

export async function fetchEncryptedNovel(novel: NovelsData) {
  if (!novel.contentPath) {
    throw new Error(`Novel content path not found: ${novel.id}`);
  }

  const res = await fetch(assetUrl(novel.contentPath));

  if (!res.ok) {
    throw new Error(`Novel content not found: ${novel.contentPath}`);
  }

  const data = (await res.json()) as Pick<NovelsData, "id" | "contentEnc">;

  if (!data.contentEnc) {
    throw new Error(`Novel encrypted content missing: ${novel.id}`);
  }

  return data.contentEnc;
}

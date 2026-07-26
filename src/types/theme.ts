export interface ThemeData {
  id: string;
  themeName: string;
  description: string;
  icon: string;
  markIcon?: string;
  themeTitle: string[];
}

export interface QuickLinkData {
  label: string;
  icon: string;
}

export interface ThemeDataset {
  quickLinks: QuickLinkData[];
  themes: ThemeData[];
}

export interface NovelsData {
  id: string;
  title: string;
  author: string;
  tags: string[];
  description: string;
  rating: number | null;
  contentEnc?: EncryptedContent;
  contentPath?: string;
}

export interface EncryptedContentV2 {
  version: 2;
  algorithm: "AES-256-GCM";
  kdf: {
    name: "scrypt";
    salt: string;
    N: number;
    r: number;
    p: number;
    keyLength: number;
  };
  iv: string;
  ciphertext: string;
  authTag: string;
}

export type EncryptedContent = string | EncryptedContentV2;

export interface Meta {
  title: string;
  author: string;
  summary: string;
}

export interface WordTitleData {
  name: string;
  icon?: string;
  cpKey?: string;
}

export interface WordData {
  id: string;
  wordName: string;
  themeId: string;
  themeName: string;
  subtitle?: string;
  wordTitle: WordTitleData[];
}

export interface WordDataset {
  tagOrder: string[];
  words: WordData[];
}

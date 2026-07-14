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
  contentEnc?: string;
  contentPath?: string;
}

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

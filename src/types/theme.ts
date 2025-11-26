export interface ThemeData {
  id: string;
  themeName: string;
  themeTitle: string[];
}

export interface NovelsData {
  id: string;
  title: string;
  author: string;
  tags: string[];
  // file: string;
  description: string;
  rating: number;
}

export interface Meta {
  title: string;
  author: string;
  summary: string;
}

export interface WordData {
  id: string;
  wordName: string;
  wordTitle: string[];
}

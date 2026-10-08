export interface SeriesChapter {
  id: string;
  title: string;
  status: "published" | "pending";
  contentPath?: string;
}

export interface SeriesStorySummary {
  id: string;
  title: string;
  category: string;
  description: string;
  publishedCount: number;
}

export interface SeriesStory extends SeriesStorySummary {
  seriesId: string;
  seriesTitle: string;
  chapters: SeriesChapter[];
}

export interface SeriesCatalog {
  id: string;
  title: string;
  stories: SeriesStorySummary[];
}

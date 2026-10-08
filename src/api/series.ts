import { SeriesCatalog, SeriesStory } from "../types/series";

function safeId(id: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error("無效的系列或作品代號");
  }
  return id;
}

async function fetchSeriesData<T>(path: string): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/series/${path}`);
  if (!response.ok) {
    throw new Error("系列資料載入失敗");
  }
  return (await response.json()) as T;
}

export async function fetchSeriesCatalog(seriesId: string) {
  return fetchSeriesData<SeriesCatalog>(`${safeId(seriesId)}/index.json`);
}

export async function fetchSeriesStory(seriesId: string, storyId: string) {
  return fetchSeriesData<SeriesStory>(`${safeId(seriesId)}/${safeId(storyId)}.json`);
}

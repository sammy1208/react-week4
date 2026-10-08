import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSeriesStory } from "../api/series";
import Nav from "../components/Nav";
import { SeriesStory } from "../types/series";

export default function SeriesStoryPage() {
  const { seriesId = "", storyId = "" } = useParams();
  const seriesPath = `/series/${seriesId}`;
  const storyPath = `${seriesPath}/${storyId}`;
  const [story, setStory] = useState<SeriesStory | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setStory(null);
    setError("");
    fetchSeriesStory(seriesId, storyId)
      .then((data) => {
        if (active) setStory(data);
      })
      .catch(() => {
        if (active) setError("章節目錄暫時無法載入。");
      });
    return () => {
      active = false;
    };
  }, [seriesId, storyId]);

  const publishedCount = story?.chapters.filter((chapter) => chapter.status === "published").length ?? 0;

  return (
    <main className="aurelis-page">
      <Nav
        variant="word"
        items={[
          { label: "書庫首頁", icon: "home", to: "/" },
          { label: story?.seriesTitle ?? "系列", to: seriesPath },
          { label: story?.title ?? "作品", current: true },
        ]}
      />

      <header className="aurelis-intro aurelis-intro--story">
        {story && <p className="aurelis-intro__eyebrow">{story.seriesTitle} · {story.category}</p>}
        <h1>{story?.title ?? (error ? "找不到作品" : "作品載入中")}</h1>
        {story?.description && <p>{story.description}</p>}
      </header>

      <section className="aurelis-volumes" aria-labelledby="story-chapters-title">
        <div className="aurelis-section-heading">
          <span className="material-symbols-outlined" aria-hidden="true">list_alt</span>
          <h2 id="story-chapters-title">章節目錄</h2>
          {story && <span className="aurelis-chapter-count">已上架 {publishedCount} 章</span>}
        </div>

        {error && <p className="aurelis-status">{error}</p>}
        {!story && !error && <p className="aurelis-status">章節目錄載入中…</p>}
        {story && (
          <ol className="aurelis-chapters">
            {story.chapters.map((chapter) => (
              <li key={chapter.id}>
                {chapter.status === "published" ? (
                  <Link className="aurelis-chapter-link" to={`${storyPath}/${chapter.id}`}>
                    <span className="aurelis-chapter-link__number">第 {chapter.id} 章</span>
                    <span className="aurelis-chapter-link__title">{chapter.title}</span>
                    <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                  </Link>
                ) : (
                  <div className="aurelis-chapter-link aurelis-chapter-link--pending">
                    <span className="aurelis-chapter-link__number">第 {chapter.id} 章</span>
                    <span className="aurelis-chapter-link__title">{chapter.title}</span>
                    <span className="aurelis-chapter-link__status">待確認</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

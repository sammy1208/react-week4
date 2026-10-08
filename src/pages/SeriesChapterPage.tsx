import { useEffect, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchEncryptedNovel } from "../api/novels";
import { fetchSeriesStory } from "../api/series";
import Nav from "../components/Nav";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { clearStoredPassword, getStoredPassword } from "../security/passwordSession";
import { SeriesChapter, SeriesStory } from "../types/series";
import { decryptContent, NovelDecryptionError } from "../utils/decrypt";

export default function SeriesChapterPage() {
  const { seriesId = "", storyId = "", chapterId = "" } = useParams();
  const seriesPath = `/series/${seriesId}`;
  const storyPath = `${seriesPath}/${storyId}`;
  const [story, setStory] = useState<SeriesStory | null>(null);
  const [chapters, setChapters] = useState<SeriesChapter[]>([]);
  const [chapter, setChapter] = useState<SeriesChapter | null>(null);
  const [content, setContent] = useState("");
  const [readerScale, setReaderScale] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setStory(null);
    setChapters([]);
    setChapter(null);
    setContent("");
    setError("");

    async function loadChapter() {
      try {
        const story = await fetchSeriesStory(seriesId, storyId);
        if (!active) return;
        setStory(story);
        const available = story.chapters.filter((item) => item.status === "published");
        const selected = available.find((item) => item.id === chapterId);
        if (!selected?.contentPath) {
          throw new Error("chapter-unavailable");
        }

        const password = getStoredPassword();
        if (!password) {
          clearStoredPassword();
          return;
        }

        const encrypted = await fetchEncryptedNovel({
          id: `${story.id}-${selected.id}`,
          contentPath: selected.contentPath,
        });
        const text = await decryptContent(encrypted, password);
        if (!active) return;
        setChapters(available);
        setChapter(selected);
        setContent(text);
      } catch (reason) {
        if (!active) return;
        if (reason instanceof NovelDecryptionError) {
          clearStoredPassword();
          return;
        }
        setError("這一章目前無法閱讀，請確認目錄及加密檔案已更新。");
      }
    }

    loadChapter();
    return () => {
      active = false;
    };
  }, [seriesId, storyId, chapterId]);

  const chapterIndex = chapters.findIndex((item) => item.id === chapterId);
  const previous = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const next = chapterIndex >= 0 ? chapters[chapterIndex + 1] : null;

  return (
    <main className="book-section aurelis-chapter-page">
      <Nav
        variant="cp"
        items={[
          { label: "書庫首頁", icon: "home", to: "/" },
          { label: story?.seriesTitle ?? "系列", to: seriesPath },
          { label: story?.title ?? "作品", to: storyPath },
          { label: chapter ? `第 ${chapter.id} 章` : "章節", current: true },
        ]}
      />

      <article className="book-reader" style={{ "--book-reader-scale": readerScale } as CSSProperties}>
        <div className="book-reader__tools">
          <button
            className="book-tool-btn"
            type="button"
            onClick={() => setReaderScale((value) => (value >= 1.12 ? 0.94 : value + 0.06))}
          >
            AA {Math.round(readerScale * 100)}%
          </button>
        </div>
        <header className="book-reader__header">
          <p className="aurelis-chapter-page__eyebrow">{story?.title ?? "作品"} · 第 {chapterId} 章</p>
          <h1 className="book-title">{chapter?.title ?? (error ? "章節無法閱讀" : "章節載入中")}</h1>
        </header>

        {error && <p className="book-status book-status--error">{error}</p>}
        {!chapter && !error && <p className="book-status">章節載入中…</p>}
        {chapter && <div className="book-article"><MarkdownRenderer content={content} /></div>}

        {chapter && (
          <nav className="aurelis-chapter-nav" aria-label="章節導覽">
            {previous ? (
              <Link to={`${storyPath}/${previous.id}`}>← 上一章</Link>
            ) : <span />}
            <Link to={storyPath}>章節目錄</Link>
            {next ? (
              <Link to={`${storyPath}/${next.id}`}>下一章 →</Link>
            ) : <span />}
          </nav>
        )}
      </article>
    </main>
  );
}

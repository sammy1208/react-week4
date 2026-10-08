import Nav from "../components/Nav";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchSeriesCatalog } from "../api/series";
import { SeriesCatalog } from "../types/series";

const volumes = ["一", "二", "三", "四", "五", "六"];

export default function AurelisPage() {
  const [catalog, setCatalog] = useState<SeriesCatalog | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchSeriesCatalog("aurelis")
      .then((data) => { if (active) setCatalog(data); })
      .catch(() => { if (active) setError("外傳目錄暫時無法載入。"); });
    return () => { active = false; };
  }, []);

  return (
    <main className="aurelis-page">
      <Nav
        variant="word"
        items={[
          { label: "書庫首頁", icon: "home", to: "/" },
          { label: "Aurelis", current: true },
        ]}
      />

      <header className="aurelis-intro">
        <p className="aurelis-intro__eyebrow">原創長篇 · 六部曲</p>
        <h1>Aurelis</h1>
        <p>一個正在展開的長篇故事。部曲、章節與外傳，將在這裡依閱讀順序陳列。</p>
      </header>

      <section className="aurelis-volumes" aria-labelledby="aurelis-volumes-title">
        <div className="aurelis-section-heading">
          <span className="material-symbols-outlined" aria-hidden="true">menu_book</span>
          <h2 id="aurelis-volumes-title">六部曲</h2>
        </div>
        <ol className="aurelis-volumes__list">
          {volumes.map((number) => (
            <li className="aurelis-volume" key={number}>
              <span className="aurelis-volume__number">{number}</span>
              <span className="aurelis-volume__title">第{number}部</span>
              <span className="aurelis-volume__status">尚未上架</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="aurelis-extras" aria-labelledby="aurelis-extras-title">
        <div className="aurelis-section-heading">
          <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
          <h2 id="aurelis-extras-title">外傳與間章</h2>
        </div>
        {error && <p role="alert">{error}</p>}
        {!catalog && !error && <p>外傳目錄載入中…</p>}
        {catalog?.stories.length === 0 && <p>外傳尚未上架。</p>}
        <div className="aurelis-stories">
          {catalog?.stories.map((story) => (
            <Link className="aurelis-story-link" key={story.id} to={`/series/${catalog.id}/${story.id}`}>
              <span>
                <strong>{story.title}</strong>
                <small>{story.category} · 已上架 {story.publishedCount} 章</small>
              </span>
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

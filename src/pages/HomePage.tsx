import { useEffect, useState } from "react";
import { QuickLinkData, ThemeData, ThemeDataset } from "../types/theme";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";

const getIconSrc = (fileName: string) => `/react-week4/img/${fileName}`;

export default function HomePage() {
  const [themeData, setThemeData] = useState<ThemeData[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLinkData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadThemes();
  }, []);

  async function loadThemes() {
    try {
      const res = await fetch("./data/themes.json");
      if (!res.ok) throw new Error("無法載入主題資料");
      const json: ThemeDataset | ThemeData[] = await res.json();

      setThemeData(Array.isArray(json) ? json : json.themes);
      setQuickLinks(Array.isArray(json) ? [] : json.quickLinks);
    } catch (error) {
      alert(`無法載入主題資料：${error}`);
    }
  }

  const handleThemeClick = (id: string) => {
    navigate(`/word/${id}`);
  };

  return (
    <main className="home-page">
      <section className="home-hero" aria-label="Nyarchive 貓貓書庫">
        <div className="home-hero__image" aria-hidden="true" />
        <div className="home-hero__content">
          <h1 className="home-hero__title">Nyarchive 貓貓書庫</h1>
          <p className="home-hero__subtitle">
            收藏小說、雜文與靈感碎片的秘密書架
          </p>
          <div className="home-hero__divider" aria-hidden="true">
            <span className="home-hero__line" />
            <span className="material-symbols-outlined home-hero__paw">
              pets
            </span>
            <span className="home-hero__line" />
          </div>
          <p className="home-hero__slogan">
            You are very much ON TIME,
            <br />
            and in your TIME ZONE destiny set up for you.
          </p>
        </div>
      </section>

      <section className="home-library" aria-label="書庫分類">
        <div className="home-library__inner">
          {themeData.map((theme) => (
            <article className="theme-card" key={theme.id}>
              <img
                className="theme-card__badge"
                src={getIconSrc(theme.icon)}
                alt=""
                aria-hidden="true"
              />

              <div className="theme-card__content">
                <div className="theme-card__heading">
                  <h2 className="theme-card__title">{theme.themeName}</h2>
                  <img
                    className="theme-card__mark"
                    src={getIconSrc(theme.markIcon ?? "book-icon.png")}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <p className="theme-card__description">{theme.description}</p>
                <div className="theme-card__tags">
                  {theme.themeTitle.map((item) => (
                    <button
                      className="theme-card__tag"
                      key={item}
                      onClick={() => handleThemeClick(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}

          {quickLinks.length > 0 && <Nav variant="home" items={quickLinks} />}
        </div>
      </section>
    </main>
  );
}

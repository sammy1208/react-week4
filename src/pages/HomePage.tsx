import { useState, useEffect } from "react";
import { ThemeData } from "../types/theme";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";

export default function HomePage() {
  const [themeData, setThemeData] = useState<ThemeData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadThemes();
  }, []);

  async function loadThemes() {
    try {
      const res = await fetch("./data/themes.json");
      if (!res.ok) throw new Error("無法載入主題資料");
      const json = await res.json();
      setThemeData(json);
    } catch (error) {
      alert(`無法載入主題資料:${error}`);
    }
  }

  const handleThemeClick = (id: string) => {
    navigate(`/word/${id}`);
  };

  return (
    <>
      <div className="hero-banner"></div>
      <section>
        <p className="homepage-slogan">
          You are very much ON TIME, and in your TIME ZONE destiny set up for
          you.
        </p>
      </section>
      <main className="theme-section">
        <div className="container">
          {themeData.map((theme) => (
            <section className="theme-card" key={theme.id}>
              <GlassCard title={theme.themeName}>
                <ul className="theme-card__list">
                  {theme.themeTitle.map((item, index) => (
                    <li
                      className="theme-card__item glass-btn-m"
                      key={index}
                      onClick={() => handleThemeClick(item)}
                      role="button"
                      tabIndex={0}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}

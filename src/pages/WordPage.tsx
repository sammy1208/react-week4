import { useEffect, useMemo, useState } from "react";
import { WordData, WordDataset, WordTitleData } from "../types/theme";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import Nav from "../components/Nav";

const emptyWord: WordData = {
  id: "",
  wordName: "",
  themeId: "",
  themeName: "",
  wordTitle: [],
};

export default function Word() {
  const navigate = useNavigate();
  const { id } = useParams();
  const decodeId = decodeURIComponent(id || "");
  const [wordData, setWordData] = useState<WordData[]>([]);
  const [query, setQuery] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [cpData, setCpData] = useState<WordData>(emptyWord);

  async function loadWordData() {
    const res = await fetch("./data/word.json");
    const data: WordDataset | WordData[] = await res.json();
    setWordData(Array.isArray(data) ? data : data.words);
  }

  useEffect(() => {
    loadWordData();
  }, []);

  useEffect(() => {
    if (wordData.length === 0) return;

    const found = wordData.find((item) => item.id === decodeId);
    if (found) {
      setCpData(found);
      return;
    }

    console.warn("找不到分類資料", decodeId);
  }, [wordData, decodeId]);

  const filteredTitles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const titles = normalizedQuery
      ? cpData.wordTitle.filter((item) =>
          item.name.toLocaleLowerCase().includes(normalizedQuery)
        )
      : [...cpData.wordTitle];

    return titles.sort((a, b) =>
      isAscending
        ? a.name.localeCompare(b.name, "zh-Hant")
        : b.name.localeCompare(a.name, "zh-Hant")
    );
  }, [cpData.wordTitle, isAscending, query]);

  const handleBookClick = (item: WordTitleData) => {
    navigate(`/CP/${item.name}`);
  };

  const pageTitle = cpData.wordName || decodeId;

  return (
    <main className="word-page">
      <Nav
        variant="word"
        items={[
          { label: cpData.themeName || "全部分類", icon: "home", to: "/" },
          { label: pageTitle, current: true },
        ]}
      />

      <section className="word-hero" aria-labelledby="word-page-title">
        <h1 className="word-hero__title" id="word-page-title">
          {pageTitle}
        </h1>
        <div className="word-hero__divider" aria-hidden="true">
          <span />
          <span className="material-symbols-outlined">pets</span>
          <span />
        </div>
        <p className="word-hero__subtitle">
          {cpData.subtitle ?? `收錄${pageTitle}相關的小說與創作筆記`}
        </p>
      </section>

      <section className="word-panel" aria-label={`${pageTitle}分類列表`}>
        <div className="word-toolbar">
          <label className="word-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋角色名、配對或關鍵字..."
            />
          </label>

          <button
            className="word-sort"
            type="button"
            onClick={() => setIsAscending((prev) => !prev)}
          >
            <span className="material-symbols-outlined">filter_alt</span>
            <span>排序</span>
            <span className="material-symbols-outlined">
              {isAscending ? "keyboard_arrow_down" : "keyboard_arrow_up"}
            </span>
          </button>
        </div>

        <ul className="word-list">
          {filteredTitles.map((item) => (
            <li key={item.name}>
              <button
                className="word-list__item"
                type="button"
                onClick={() => handleBookClick(item)}
              >
                <span className="material-symbols-outlined word-list__icon">
                  {item.icon ?? "menu_book"}
                </span>
                <span className="word-list__title">{item.name}</span>
                <span className="material-symbols-outlined word-list__arrow">
                  chevron_right
                </span>
              </button>
            </li>
          ))}
        </ul>

        {filteredTitles.length === 0 && (
          <p className="word-empty">沒有找到符合「{query}」的項目。</p>
        )}
      </section>
    </main>
  );
}

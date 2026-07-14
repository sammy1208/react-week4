import { useEffect, useMemo, useState } from "react";
import { NovelsData, WordData, WordDataset, WordTitleData } from "../types/theme";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import Nav from "../components/Nav";
import { fetchNovelList } from "../api/novels";

type CompanionMeta = {
  themeName: string;
  wordId: string;
  wordName: string;
  item: WordTitleData;
};

const allTagLabel = "全部";
const pageSize = 12;

function findCompanionMeta(words: WordData[], cpId: string): CompanionMeta | null {
  for (const word of words) {
    const item = word.wordTitle.find((title) => title.name === cpId || title.cpKey === cpId);
    if (!item) continue;

    return {
      themeName: word.themeName,
      wordId: word.id,
      wordName: word.wordName,
      item,
    };
  }

  return null;
}

export default function CompanionPage() {
  const navigate = useNavigate();
  const { cpId } = useParams<{ cpId: string }>();
  const decodeId = decodeURIComponent(cpId || "");
  const [novelsData, setNovelsData] = useState<NovelsData[]>([]);
  const [wordData, setWordData] = useState<WordData[]>([]);
  const [tagOrder, setTagOrder] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState(allTagLabel);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const companionMeta = useMemo(
    () => findCompanionMeta(wordData, decodeId),
    [decodeId, wordData]
  );
  const cpKey = companionMeta?.item.cpKey ?? decodeId;
  const displayName = companionMeta?.item.name ?? decodeId;

  useEffect(() => {
    loadWordDataset();
  }, []);

  async function loadWordDataset() {
    const res = await fetch("./data/word.json");
    const data: WordDataset | WordData[] = await res.json();

    if (Array.isArray(data)) {
      setWordData(data);
      setTagOrder([]);
      return;
    }

    setWordData(data.words);
    setTagOrder(data.tagOrder);
  }

  useEffect(() => {
    if (!companionMeta) {
      if (wordData.length > 0) {
        console.warn("找不到 CP 資料:", decodeId);
      }
      setNovelsData([]);
      setIsLoading(false);
      return;
    }

    if (!cpKey) {
      console.warn("此 CP 尚未設定 cpKey:", decodeId);
      setNovelsData([]);
      setIsLoading(false);
      setLoadError("此分類尚未設定資料來源。");
      return;
    }

    let ignore = false;
    setIsLoading(true);
    setLoadError("");

    fetchNovelList(cpKey)
      .then((list) => {
        if (ignore) return;
        setNovelsData(list);
        setActiveTag(allTagLabel);
        setVisibleCount(pageSize);
      })
      .catch((error) => {
        if (ignore) return;
        console.error("小說清單載入失敗:", error);
        setLoadError("小說清單載入失敗，請確認加密資料已重新產生。");
        setNovelsData([]);
      })
      .finally(() => {
        if (ignore) return;
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [companionMeta, cpKey, decodeId, wordData.length]);

  const tags = useMemo(() => {
    const rawTags = [...new Set(novelsData.flatMap((item) => item.tags ?? []))];

    return rawTags.sort((a, b) => {
      const indexA = tagOrder.indexOf(a);
      const indexB = tagOrder.indexOf(b);

      if (indexA === -1 && indexB === -1) return a.localeCompare(b, "zh-Hant");
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });
  }, [novelsData, tagOrder]);

  const visibleNovels = useMemo(() => {
    if (activeTag === allTagLabel) return novelsData;
    return novelsData.filter((novel) => novel.tags?.includes(activeTag));
  }, [activeTag, novelsData]);
  const displayedNovels = visibleNovels.slice(0, visibleCount);
  const hasMoreNovels = visibleCount < visibleNovels.length;

  function handleTag(tag: string) {
    setActiveTag(tag);
    setVisibleCount(pageSize);
  }

  function handleLoadMore() {
    setVisibleCount((current) => Math.min(current + pageSize, visibleNovels.length));
  }

  const handleBook = (id: string) => {
    if (!cpKey) return;
    navigate(`/CP/${cpKey}/${id}`);
  };

  return (
    <main className="cp-page">
      <Nav
        variant="cp"
        items={[
          { label: companionMeta?.themeName ?? "全部分類", icon: "home", to: "/" },
          {
            label: companionMeta?.wordName ?? "分類",
            to: companionMeta ? `/word/${companionMeta.wordId}` : "/",
          },
          { label: displayName, current: true },
        ]}
      />

      <section className="cp-hero" aria-labelledby="cp-page-title">
        <h1 className="cp-hero__title" id="cp-page-title">
          {displayName}
        </h1>
        <div className="cp-hero__divider" aria-hidden="true">
          <span />
          <span className="material-symbols-outlined">pets</span>
          <span />
        </div>
        <p className="cp-hero__subtitle">收錄{displayName}相關文章</p>
      </section>

      <section className="cp-list-panel" aria-label={`${displayName}文章列表`}>
        <div className="cp-filter-bar">
          <div className="cp-filter-tabs" aria-label="文章標籤篩選">
            <button
              className={`cp-filter-tab ${activeTag === allTagLabel ? "is-active" : ""}`}
              type="button"
              onClick={() => handleTag(allTagLabel)}
            >
              {allTagLabel}
            </button>
            {tags.map((tag) => (
              <button
                className={`cp-filter-tab ${activeTag === tag ? "is-active" : ""}`}
                type="button"
                key={tag}
                onClick={() => handleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="cp-count-pill" aria-label={`${visibleNovels.length} 篇文章`}>
            <span className="material-symbols-outlined">article</span>
            <span>{visibleNovels.length} 篇文章</span>
          </div>
        </div>

        {isLoading && <p className="cp-status">小說清單載入中...</p>}
        {loadError && <p className="cp-status cp-status--error">{loadError}</p>}

        {!isLoading && !loadError && (
          <ul className="cp-article-list">
            {displayedNovels.map((item) => (
              <li key={item.id}>
                <button
                  className="cp-article-card"
                  type="button"
                  onClick={() => handleBook(item.id)}
                >
                  <span className="cp-article-card__spark" aria-hidden="true">
                    ✦
                  </span>

                  <div className="cp-article-card__body">
                    <h2 className="cp-article-card__title">{item.title}</h2>

                    <div className="cp-article-card__tags">
                      {(item.tags?.length ? item.tags : ["未分類"]).map((tag) => (
                        <span className="cp-article-card__tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="cp-article-card__description">
                      {item.description || "尚未填寫文章描述。"}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && !loadError && hasMoreNovels && (
          <div className="cp-load-more">
            <button className="cp-load-more__button" type="button" onClick={handleLoadMore}>
              載入更多
            </button>
            <p className="cp-load-more__count">
              已顯示 {displayedNovels.length} / {visibleNovels.length} 篇
            </p>
          </div>
        )}

        {!isLoading && !loadError && visibleNovels.length === 0 && (
          <p className="cp-empty">目前沒有符合條件的文章。</p>
        )}
      </section>
    </main>
  );
}

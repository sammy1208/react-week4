import { useEffect, useMemo, useState } from "react";
import { NovelsData, WordData, WordDataset, WordTitleData } from "../types/theme";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import CP_MAP from "../data_encrypted";
import Nav from "../components/Nav";

type CompanionMeta = {
  themeName: string;
  wordId: string;
  wordName: string;
  item: WordTitleData;
};

const allTagLabel = "全部";

function findCompanionMeta(words: WordData[], cpName: string): CompanionMeta | null {
  for (const word of words) {
    const item = word.wordTitle.find((title) => title.name === cpName);
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

  const companionMeta = useMemo(
    () => findCompanionMeta(wordData, decodeId),
    [decodeId, wordData]
  );
  const cpKey = companionMeta?.item.cpKey ?? "";

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
      return;
    }

    if (!cpKey) {
      console.warn("此 CP 尚未設定 cpKey:", decodeId);
      setNovelsData([]);
      return;
    }

    const list = CP_MAP[cpKey];
    if (!list) {
      setNovelsData([]);
      return;
    }

    const safeList = list.map((novel: NovelsData) => ({
      id: novel.id,
      title: novel.title,
      author: novel.author,
      tags: novel.tags,
      description: novel.description,
      rating: novel.rating,
      contentEnc: novel.contentEnc,
    }));

    setNovelsData(safeList);
    setActiveTag(allTagLabel);
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
          { label: decodeId, current: true },
        ]}
      />

      <section className="cp-hero" aria-labelledby="cp-page-title">
        <h1 className="cp-hero__title" id="cp-page-title">
          {decodeId}
        </h1>
        <div className="cp-hero__divider" aria-hidden="true">
          <span />
          <span className="material-symbols-outlined">pets</span>
          <span />
        </div>
        <p className="cp-hero__subtitle">收錄{decodeId}相關文章</p>
      </section>

      <section className="cp-list-panel" aria-label={`${decodeId}文章列表`}>
        <div className="cp-filter-bar">
          <div className="cp-filter-tabs" aria-label="文章標籤篩選">
            <button
              className={`cp-filter-tab ${activeTag === allTagLabel ? "is-active" : ""}`}
              type="button"
              onClick={() => setActiveTag(allTagLabel)}
            >
              {allTagLabel}
            </button>
            {tags.map((tag) => (
              <button
                className={`cp-filter-tab ${activeTag === tag ? "is-active" : ""}`}
                type="button"
                key={tag}
                onClick={() => setActiveTag(tag)}
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

        <ul className="cp-article-list">
          {visibleNovels.map((item) => (
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

        {visibleNovels.length === 0 && (
          <p className="cp-empty">目前沒有符合條件的文章。</p>
        )}
      </section>
    </main>
  );
}

import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import rehypeRaw from "rehype-raw";
import fm from "front-matter";
import { NovelsData, Meta, WordData, WordDataset, WordTitleData } from "../types/theme";
import { useParams } from "react-router";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { generateId } from "../utils/generateId";
import { decryptContent, NovelDecryptionError } from "../utils/decrypt";
import Nav from "../components/Nav";
import { fetchEncryptedNovel, fetchNovelList } from "../api/novels";

type BookMeta = {
  themeName: string;
  wordId: string;
  wordName: string;
  cpName: string;
  item: WordTitleData;
};

const PASSWORD_STORAGE_KEY = "novel-reader-password";

function getStoredPassword() {
  try {
    return sessionStorage.getItem(PASSWORD_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function storePassword(password: string) {
  try {
    if (password) {
      sessionStorage.setItem(PASSWORD_STORAGE_KEY, password);
    } else {
      sessionStorage.removeItem(PASSWORD_STORAGE_KEY);
    }
  } catch {
    // 部分瀏覽器停用儲存空間時，仍可在本次頁面生命週期內閱讀。
  }
}

function findBookMeta(words: WordData[], cpKey: string): BookMeta | null {
  for (const word of words) {
    const item = word.wordTitle.find((title) => title.cpKey === cpKey);
    if (!item) continue;

    return {
      themeName: word.themeName,
      wordId: word.id,
      wordName: word.wordName,
      cpName: item.name,
      item,
    };
  }

  return null;
}

function getDisplayTitle(title: string) {
  return title.replace(/^【([^】]+)】/, "").trim() || title;
}

function getWordCount(markdown: string) {
  return markdown
    .replace(/<[^>]+>/g, "")
    .replace(/[#>*_`~\-[\](){}]/g, "")
    .replace(/\s/g, "").length;
}

function getReaderScaleLabel(scale: number) {
  return `${Math.round(scale * 100)}%`;
}

export default function BookPage() {
  const [content, setContent] = useState("");
  const { cpId, bookId } = useParams<{ cpId: string; bookId: string }>();
  const decodeCpId = decodeURIComponent(cpId || "");
  const decodeBookId = decodeURIComponent(bookId || "");
  const [hasToc, setHasToc] = useState(false);
  const [readerScale, setReaderScale] = useState(1);
  const [novelData, setNovelData] = useState<NovelsData | null>(null);
  const [wordData, setWordData] = useState<WordData[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [unlockPassword, setUnlockPassword] = useState(getStoredPassword);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(
    () => !getStoredPassword(),
  );
  const [meta, setMeta] = useState<Meta>({
    title: "",
    author: "",
    summary: "",
  });

  const [toc, setToc] = useState<{ title: string; id: string }[]>([]);

  const bookMeta = findBookMeta(wordData, decodeCpId);
  const displayTitle = getDisplayTitle(meta.title || novelData?.title || decodeBookId);

  useEffect(() => {
    loadWordDataset();
  }, []);

  useEffect(() => {
    if (!decodeCpId || !decodeBookId) return;
    loadBook(decodeCpId, decodeBookId, unlockPassword);
  }, [decodeCpId, decodeBookId, unlockPassword]);

  async function loadWordDataset() {
    const res = await fetch("./data/word.json");
    const data: WordDataset | WordData[] = await res.json();
    setWordData(Array.isArray(data) ? data : data.words);
  }

  async function loadBook(cpKey: string, novelId: string, password: string) {
    setIsLoading(true);
    setLoadError("");
    setContent("");
    setNovelData(null);
    setWordCount(0);
    setToc([]);
    setMeta({ title: "", author: "", summary: "" });
    if (password) setPasswordError("");

    try {
      const list = await fetchNovelList(cpKey);
      const novel = list.find((item: NovelsData) => item.id === novelId);

      if (!novel) {
        setLoadError("找不到指定小說，請確認書單資料是否已更新。");
        return;
      }

      setNovelData(novel);

      if (!password) {
        setRequiresPassword(true);
        return;
      }

      const contentEnc = await fetchEncryptedNovel(novel);
      const decrypted = await decryptContent(contentEnc, password);

      // 2️⃣ 解析 front-matter
      const { attributes, body } = fm<Meta>(decrypted);
      setMeta(attributes as Meta);
      setContent(body);
      setWordCount(getWordCount(body));
      setRequiresPassword(false);
      setPasswordError("");
      setPasswordInput("");
      storePassword(password);

      // 3️⃣ 產生 TOC
      const tocData = extractToc(body);
      setToc(tocData);
    } catch (error) {
      if (error instanceof NovelDecryptionError) {
        storePassword("");
        setUnlockPassword("");
        setRequiresPassword(true);
        setPasswordError("密碼不正確，或文章的加密資料已損毀。");
        return;
      }

      console.error("解密或解析小說內容失敗:", error);
      setLoadError("小說載入失敗，請確認加密檔案已產生並重新部署。");
    } finally {
      setIsLoading(false);
    }
  }

  function extractToc(body: string) {
    const toc: { title: string; id: string }[] = [];
    const regex = /^#{1,3}\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(body)) !== null) {
      toc.push({
        title: match[1], // 章節標題
        id: generateId(match[1]),
      });
    }
    return toc;
  }

  function handleReaderScale() {
    setReaderScale((current) => (current >= 1.12 ? 0.94 : current + 0.06));
  }

  function handleUnlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordInput) {
      setPasswordError("請輸入閱讀密碼。");
      return;
    }

    setPasswordError("");
    setUnlockPassword(passwordInput);
  }

  function handleLock() {
    storePassword("");
    setUnlockPassword("");
    setPasswordInput("");
    setPasswordError("");
    setContent("");
    setMeta({ title: "", author: "", summary: "" });
    setWordCount(0);
    setToc([]);
    setRequiresPassword(true);
  }

  function handleToc() {
    setHasToc((prev) => !prev);
  }

  function handleScrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <main className="book-section">
        <Nav
          variant="cp"
          items={[
            { label: bookMeta?.themeName ?? "全部分類", icon: "home", to: "/" },
            {
              label: bookMeta?.wordName ?? "分類",
              to: bookMeta ? `/word/${bookMeta.wordId}` : "/",
            },
            {
              label: bookMeta?.cpName ?? decodeCpId,
              to: bookMeta ? `/CP/${bookMeta.item.cpKey}` : `/CP/${decodeCpId}`,
            },
            { label: displayTitle, current: true },
          ]}
        />

        <article
          className="book-reader"
          style={{ "--book-reader-scale": readerScale } as React.CSSProperties}
        >
          <div className="book-reader__tools" aria-label="閱讀工具">
            <button className="book-tool-btn" type="button" onClick={handleReaderScale}>
              <span className="book-tool-btn__aa">AA</span>
              <span>字級 {getReaderScaleLabel(readerScale)}</span>
            </button>
            {!requiresPassword && content ? (
              <button className="book-tool-btn" type="button" onClick={handleLock}>
                <span className="material-symbols-outlined">lock</span>
                <span>鎖定</span>
              </button>
            ) : null}
          </div>

          <header className="book-reader__header">
            <h1 className="book-title">{meta.title || displayTitle}</h1>
            <div className="book-author">
              <span className="book-author__ornament" aria-hidden="true" />
              <strong>{meta.author || novelData?.author || "未知"}</strong>
              <span className="book-author__ornament" aria-hidden="true" />
            </div>

            <dl className="book-meta-row">
              {novelData?.tags?.length ? (
                <div className="book-meta-row__item">
                  <dt>
                    <span className="material-symbols-outlined">bookmark</span>
                    標籤
                  </dt>
                  <dd>{novelData.tags.join("、")}</dd>
                </div>
              ) : null}

              {wordCount > 0 && (
                <div className="book-meta-row__item">
                  <dt>
                    <span className="material-symbols-outlined">edit_note</span>
                    字數
                  </dt>
                  <dd>{wordCount.toLocaleString()} 字</dd>
                </div>
              )}
            </dl>
          </header>

          {isLoading && <p className="book-status">小說載入中...</p>}
          {loadError && <p className="book-status book-status--error">{loadError}</p>}

          {!isLoading && !loadError && requiresPassword ? (
            <section className="book-unlock" aria-labelledby="book-unlock-title">
              <span className="material-symbols-outlined book-unlock__icon" aria-hidden="true">
                encrypted
              </span>
              <h2 id="book-unlock-title">輸入閱讀密碼</h2>
              <p>文章已加密保護。密碼只會保留到目前的瀏覽器分頁關閉。</p>
              <form className="book-unlock__form" onSubmit={handleUnlock}>
                <label htmlFor="novel-password">閱讀密碼</label>
                <div className="book-unlock__controls">
                  <input
                    id="novel-password"
                    type="password"
                    value={passwordInput}
                    onChange={(event) => setPasswordInput(event.target.value)}
                    autoComplete="current-password"
                    autoFocus
                    aria-describedby={passwordError ? "novel-password-error" : undefined}
                  />
                  <button type="submit">解鎖文章</button>
                </div>
                {passwordError ? (
                  <p
                    id="novel-password-error"
                    className="book-unlock__error"
                    role="alert"
                  >
                    {passwordError}
                  </p>
                ) : null}
              </form>
            </section>
          ) : null}

          {!isLoading && !loadError && !requiresPassword && meta.summary && (
            <section className="book-summary" aria-label="Summary">
              <h2 className="book-summary__title">
                <span aria-hidden="true">✦</span>
                Summary:
              </h2>
              <div className="book-summary__body">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {meta.summary}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {!isLoading && !loadError && !requiresPassword && (
            <div className="book-article">
              <MarkdownRenderer content={content} />
            </div>
          )}
        </article>
      </main>

      {toc.length !== 0 && (
        <button
          className="book-floating-btn book-floating-btn--toc"
          type="button"
          onClick={handleToc}
          aria-label={hasToc ? "關閉目錄" : "開啟目錄"}
          aria-expanded={hasToc}
        >
          <span className="material-symbols-outlined">format_list_bulleted</span>
        </button>
      )}

      <button
        className="book-floating-btn book-floating-btn--top"
        type="button"
        onClick={handleScrollTop}
        aria-label="回到最上方"
      >
        <span className="material-symbols-outlined">keyboard_arrow_up</span>
      </button>

      {hasToc ? (
        <div
          className={`book-toc ${hasToc ? "open" : ""} scrollbar`}
        >
          <h3 className="book-toc__title">目錄</h3>
          <ul>
            {toc.map((item, index) => (
              <li key={`${item.id}-${index}`}>
                <button
                  className="book-toc__link"
                  onClick={() => {
                    const el = document.getElementById(generateId(item.title));
                    el?.scrollIntoView({ behavior: "smooth" });
                    setHasToc(false);
                  }}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        ""
      )}
    </>
  );
}


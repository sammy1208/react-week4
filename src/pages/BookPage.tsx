import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import rehypeRaw from "rehype-raw";
import fm from "front-matter";
import { NovelsData, Meta, WordData, WordDataset, WordTitleData } from "../types/theme";
import { useParams } from "react-router";
import CP_MAP from "../data_encrypted";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { generateId } from "../utils/generateId";
import { decryptContent } from "../utils/decrypt";
import Nav from "../components/Nav";

type BookMeta = {
  themeName: string;
  wordId: string;
  wordName: string;
  cpName: string;
  item: WordTitleData;
};

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
    if (!cpId || !bookId) return;
    loadBook(cpId, bookId);
  }, [decodeCpId, decodeBookId]);

  async function loadWordDataset() {
    const res = await fetch("./data/word.json");
    const data: WordDataset | WordData[] = await res.json();
    setWordData(Array.isArray(data) ? data : data.words);
  }

  async function loadBook(cpId: string, bookId: string) {
    if (!decodeCpId || !decodeBookId) return;

    const list = CP_MAP[decodeCpId]; // ⬅ 直接取得該 CP 的加密小說列表

    if (!list) {
      console.warn("找不到 CP:", decodeCpId);
      return;
    }

    const novel = list.find((n: NovelsData) => n.id === bookId);

    if (!novel) {
      console.log("找不到指定小說:", decodeBookId);
      return;
    }

    try {
      // 1️⃣ 解密 markdown 內容
      const decrypted = await decryptContent(novel.contentEnc);

      // 2️⃣ 解析 front-matter
      const { attributes, body } = fm<Meta>(decrypted);
      setMeta(attributes as Meta);
      setContent(body);
      setNovelData(novel);
      setWordCount(getWordCount(body));

      // 3️⃣ 產生 TOC
      const tocData = extractToc(body);
      setToc(tocData);
    } catch (error) {
      console.error("解密或解析小說內容失敗:", error);
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
          </div>

          <header className="book-reader__header">
            <h1 className="book-title">{meta.title}</h1>
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

          {meta.summary && (
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

          <div className="book-article">
            <MarkdownRenderer content={content} />
          </div>
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

// import { useEffect, useState } from "react";
// import matter from "gray-matter";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";

// function NovelReader() {
//   const [meta, setMeta] = useState({});
//   const [content, setContent] = useState("");

//   useEffect(() => {
//     fetch("/novels/moon_meet.md")
//       .then((res) => res.text())
//       .then((text) => {
//         const { data, content } = matter(text);
//         setMeta(data);
//         setContent(content);
//       });
//   }, []);

//   return (
//     <div className="min-h-screen bg-[#7A8FA2] text-[#EAE8E1] px-8 py-10">
//       {/* 可選：顯示書籍資料 */}
//       <h1 className="text-3xl font-serif mb-2">{meta.title}</h1>
//       {meta.author && <p className="text-sm mb-6">作者：{meta.author}</p>}

//       {/* ✅ 只渲染內容部分 */}
//       <article className="prose prose-invert max-w-none">
//         <ReactMarkdown remarkPlugins={[remarkGfm]}>
//           {content}
//         </ReactMarkdown>
//       </article>
//     </div>
//   );
// }

// export default NovelReader;

// import CP_MAP from "../data_encrypted";
// import { decryptContent } from "../utils/decrypt";

// async function loadBook() {
//   const list = CP_MAP[cpData];
//   const novel = list.find(n => n.id === bookId);

//   const decrypted = await decryptContent(novel.contentEnc);

//   setContent(decrypted);
// }

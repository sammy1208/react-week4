import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import rehypeRaw from "rehype-raw";
import fm from "front-matter";
import { NovelsData, Meta } from "../types/theme";
import { useParams } from "react-router";
import CP_MAP from "../data_encrypted";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { generateId } from "../utils/generateId";
import { decryptContent } from "../utils/decrypt";

export default function BookPage() {
  const [content, setContent] = useState("");
  const { cpId, bookId } = useParams<{ cpId: string; bookId: string }>();
  const decodeCpId = decodeURIComponent(cpId || "");
  const decodeBookId = decodeURIComponent(bookId || "");
  const [hasToc, setHasToc] = useState(false);
  const [meta, setMeta] = useState<Meta>({
    title: "",
    author: "",
    summary: "",
  });

  const [toc, setToc] = useState<{ title: string; id: string }[]>([]);

  useEffect(() => {
    if (!cpId || !bookId) return;
    loadBook(cpId, bookId);
  }, [decodeCpId, decodeBookId]);

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

      // 3️⃣ 產生 TOC
      const tocData = extractToc(body);
      setToc(tocData);
    } catch (error) {
      console.error("解密或解析小說內容失敗:", error);
    }
  }

  function extractToc(body: string) {
    const toc: { title: string; id: string }[] = [];
    const regex = /# (.+)/g; // 查找二級標題 (如 ## 第一章)
    let match;
    while ((match = regex.exec(body)) !== null) {
      toc.push({
        title: match[1], // 章節標題
        id: generateId(match[1]),
      });
    }
    return toc;
  }

  function handleToc() {
    setHasToc((prev) => !prev);
  }

  return (
    <>
      <div className="container book-section">
        <div className="glass-card--nobackground">
          <h2 className="book-title">{meta.title}</h2>
          <p className="author">{meta.author}</p>
          <div className="description">
            <p className="description-title">Summary:</p>
            <div className="description-p">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {meta.summary}
              </ReactMarkdown>
            </div>
          </div>
          {/* 目錄 */}
          <div className="article">
            <MarkdownRenderer content={content} />
          </div>
        </div>
      </div>
      {toc.length !== 0 ? (
        <button className=" toc-btn " onClick={handleToc}></button>
      ) : (
        ""
      )}

      {hasToc ? (
        <div
          className={`toc ${hasToc ? "open" : ""} glass-card--border scrollbar`}
        >
          <h3 className="sidebar-title">目錄</h3>
          <ul>
            {toc.map((item, index) => (
              <li key={`${item.id}-${index}`}>
                <button
                  className="toc-list glass-btn-m"
                  onClick={() => {
                    const el = document.getElementById(generateId(item.title));
                    el?.scrollIntoView({ behavior: "smooth" });
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

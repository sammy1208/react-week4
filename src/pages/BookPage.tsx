import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import rehypeRaw from "rehype-raw";
import fm from "front-matter";
import { Meta } from "../types/theme";
import { useParams } from "react-router";
import { NovelsData } from "../types/theme";
import MarkdownRenderer from "../components/ReactMarkdown";

export default function BookPage() {
  const [content, setContent] = useState("");
  const { cpId, bookId } = useParams<{ cpId: string; bookId: string }>();
  const decodeCpId = decodeURIComponent(cpId || "");
  const decodeBookId = decodeURIComponent(bookId || "");
  const [meta, setMeta] = useState<Meta>({
    title: "",
    author: "",
    summary: "",
  });

  const [toc, setToc] = useState<{ title: string; id: string }[]>([]);

  useEffect(() => {
    loadBook(decodeBookId);
  }, []);

  async function getNovels(data: NovelsData) {
    const res = await fetch(`./novels/${data.file}`);
    const text = await res.text();

    const { attributes, body } = fm(text);
    setContent(body);
    setMeta(attributes as Meta);

    const tocData = extractToc(body);
    setToc(tocData);
  }
  async function loadBook(bookId: string) {
    const res = await fetch(`./data/${decodeCpId}.json`);
    if (!res.ok) throw new Error("無法載入主題資料");
    const json: NovelsData[] = await res.json();

    const novel = json.find((n) => n.id === bookId);

    if (!novel) {
      console.log("找不到指定小說:", decodeBookId);
      return;
    }

    getNovels(novel);
  }

  function extractToc(body: string) {
    const toc: { title: string; id: string }[] = [];
    const regex = /# (.+)/g; // 查找二級標題 (如 ## 第一章)
    let match;
    while ((match = regex.exec(body)) !== null) {
      toc.push({
        title: match[1], // 章節標題
        id: match[1].toLowerCase().replace(/\s+/g, "-"), // 用標題生成 ID
      });
    }
    return toc;
  }

  return (
    <>
      <div className="book-main container">
        <h2 className="book-title">{meta.title}</h2>
        <p className="author">{meta.author}</p>
        <div className="description">
          <p className="description-title">Summary:</p>
          <div className="description-p">
            <ReactMarkdown>{meta.summary}</ReactMarkdown>
          </div>
        </div>
        {/* 目錄 */}
        {/* <div className="toc">
          <h3>目錄</h3>
          <ul>
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.title}</a>
              </li>
            ))}
          </ul>
        </div> */}
        <div className="article">
          {/* <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown> */}
          <MarkdownRenderer content={content} />
        </div>
      </div>
      {/* <div className="container jc-center">
        <div className=" bookpage">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
        </div>
        <div className="1212 bookpage1">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
        </div>
        <div className=" bookpage2">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
        </div>
      </div> */}
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

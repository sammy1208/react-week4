import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import rehypeRaw from "rehype-raw";
import fm from "front-matter";
import { Meta } from "../types/theme";
import { useParams } from "react-router";
import { NovelsData } from "../types/theme";

export default function BookPage() {
  const [content, setContent] = useState("");
  const { id } = useParams<{ id: string }>();
  const decodeId = decodeURIComponent(id || "");
  const [meta, setMeta] = useState<Meta>({
    title: "",
    author: "",
    summary: "",
  });

  useEffect(() => {
    loadBook(decodeId);
  }, []);

  async function getNovels(data: NovelsData) {
    const res = await fetch(`./novels/${data.file}`);
    console.log(res);
    const text = await res.text();

    const { attributes, body } = fm(text);
    setContent(body);
    setMeta(attributes as Meta);
  }
  async function loadBook(bookId: string) {
    const res = await fetch("./data/novels.json");
    if (!res.ok) throw new Error("無法載入主題資料");
    const json: NovelsData[] = await res.json();

    const novel = json.find((n) => n.id === bookId);

    if (!novel) {
      console.log("找不到指定小說:", bookId);
      return;
    }

    getNovels(novel);
  }
  return (
    <>
      <div className="book-main container">
        <h2 className="book-title">{meta.title}</h2>
        <p className="author">{meta.author}</p>
        <div className="description">
          <p className="description-title">Summary:</p>
          <p className="description-p">{meta.summary}</p>
        </div>
        <div className="article">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
        </div>
      </div>
      {/* <div className="container jc-center">
        <div className=" bookpage">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
        </div>
        <div className=" bookpage1">
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

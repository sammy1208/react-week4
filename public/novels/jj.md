很好 — 我把整個流程從頭到尾拆成 概念 + 必要套件 + 前端實作範例 (TypeScript + React + Vite)，並說明每個步驟為什麼要這樣做、常見陷阱與進階選項。你可以直接把範例貼到專案改用（或按需簡化）。

概念總覽

YAML Frontmatter（放在 Markdown 檔最上方的 --- 區塊）用來存放 metadata（title、author、chapters 列表、summary...），方便前端先取得章節清單等結構化資訊。

gray-matter 是一個在 JavaScript/TypeScript 中解析 YAML frontmatter 的工具：它把 frontmatter 解析成 data（物件），剩下的正文放在 content（純 Markdown 字串）。

react-markdown 負責把 Markdown content 轉成 React 元素。你可以透過 components 覆寫特定 tag（例如 h1、h2）來加上 id 或其他行為（這對章節跳轉很重要）。

為了安全若要解析 Markdown 裡的 raw HTML，要同時使用 rehype-raw + rehype-sanitize（或避免 raw HTML）。

章節跳轉（點選 Header 的章節）可用 document.getElementById(id).scrollIntoView({behavior:'smooth'})，或改用 router hash /#id。

安裝需要的套件

在 Vite (React + TS) 專案下安裝：

npm install react-markdown remark-gfm gray-matter
# 若需要處理 raw HTML（小心 XSS）：
npm install rehype-raw rehype-sanitize
# 若想自動為 headings 產生 slug id：
npm install remark-slug rehype-autolink-headings

Markdown 範例（含 frontmatter）

把檔案放 public/novels/galaxy_dream.md（或你想放的路徑）：

---
id: "galaxy_dream"
title: "星河夢境"
author: "蘇念"
summary: |
  夢境與現實交錯的奇幻冒險。
chapters:
  - id: "c1"
    title: "第一章 星河初現"
  - id: "c2"
    title: "第二章 虛空之門"
  - id: "c3"
    title: "第三章 夢中之城"
---

# 第一章 星河初現

夜空下，少女望著遠方的流星，彷彿看見了命運的微光...

# 第二章 虛空之門

風聲低鳴，門扉緩緩開啟...

# 第三章 夢中之城

城市漂浮於雲層之上...


重點：chapters 在 frontmatter 內給了章節 ID 與標題（這能讓你在 Header 用已知 ID 跳轉）。同時 Markdown 裡也要有對應的標題，或你可以在渲染時把 chapters 與 Markdown 標題對應起來。

TypeScript 型別（放 src/types/novel.ts）
export interface ChapterMeta {
  id: string;
  title: string;
}

export interface NovelMeta {
  id: string;
  title?: string;
  author?: string;
  summary?: string;
  chapters?: ChapterMeta[];
  file?: string; // md 路徑
}

實作範例：NovelPage.tsx（載入 .md, 解析 frontmatter, 渲染 Markdown，並為 headings 加 id）

完整功能：

fetch JSON 或 md metadata（這範例直接 fetch md），

用 gray-matter 解析 frontmatter（拿到 meta.chapters）並放到 store/Context（供 Header 使用），

用 react-markdown 渲染 content，在 heading 渲染器加 id（以 meta.chapters 的 id 對應 title），

支援點選 Header chapter 時 scrollIntoView()。

// src/pages/NovelPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { NovelMeta, ChapterMeta } from "../types/novel";
import { useNovelStore } from "../store/useNovelStore"; // 或 Context

// 若需要 raw HTML（慎用）
// import rehypeRaw from "rehype-raw";
// import rehypeSanitize from "rehype-sanitize";

export default function NovelPage() {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<NovelMeta | null>(null);
  const [content, setContent] = useState<string>("");
  const setChapters = useNovelStore((s) => s.setChapters); // 假設你用 Zustand

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const res = await fetch(`/novels/${id}.md`);
      if (!res.ok) throw new Error("找不到小說檔案");
      const text = await res.text();
      const parsed = matter(text); // { data, content }
      const data = parsed.data as NovelMeta;
      setMeta({ ...data, id }); // 儲存 meta
      setContent(parsed.content);
      // 如果 frontmatter 有 chapters，丟到全域 store（Header 會用）
      if (Array.isArray(data.chapters)) {
        setChapters(data.chapters as ChapterMeta[]);
      } else {
        // 若沒有 chapters，你也可以自動偵測（下一段示範）
        setChapters([]);
      }
    };

    load().catch((e) => {
      console.error(e);
      // 顯示錯誤 UI 或 fallback
    });
  }, [id, setChapters]);

  // 建立一個 mapping: title -> id（若 frontmatter 有 chapters）
  const titleToIdMap = useMemo(() => {
    const map = new Map<string, string>();
    if (meta?.chapters) {
      meta.chapters.forEach((c) => map.set(c.title.trim(), c.id));
    }
    return map;
  }, [meta]);

  // react-markdown components override：為 h1/h2 加 id
  const components = {
    h1: ({ node, children }: any) => {
      // children 可能是 ['第一章 星河初現'] 或一個 React node
      const text = String(children?.[0] ?? "").trim();
      // 優先用 frontmatter 提供的 id，否則產生 slug (簡單替代)
      const anchorId = titleToIdMap.get(text) ?? text.replace(/\s+/g, "-");
      return (
        <h1 id={anchorId} className="chapter-title">
          {children}
        </h1>
      );
    },
    // 若你有 h2/h3 也可以同理處理
  };

  return (
    <div className="book-main container">
      <h2 className="book-title">{meta?.title}</h2>
      <p className="author">{meta?.author}</p>

      <div className="description">
        <p className="description-title">Summary:</p>
        <p className="description-p">{meta?.summary}</p>
      </div>

      <div className="article">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          // rehypePlugins={[rehypeRaw, rehypeSanitize]} // only if you need raw HTML and sanitize
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}


重點說明：

matter(text) 把 frontmatter 解析為 data（metadata）與 content（Markdown 內文）。

titleToIdMap 幫你把 frontmatter 中的 chapters（title/id）對應到 Markdown heading。這讓你在 header 中可以直接用 frontmatter 的 id 做跳轉（不必把 heading text 當 id）。

components.h1 為每個 # 標題插入 id，讓 document.getElementById(id) 可找到目標。

Header（漢堡選單）：拿 chapters 並跳轉

假設你把章節放到全域 store（useNovelStore），Header 可以這樣做：

// src/components/Header.tsx
import React from "react";
import { useNovelStore } from "../store/useNovelStore";

export default function Header() {
  const chapters = useNovelStore((s) => s.chapters);

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      // 若找不到，可能需要路由導向再跳轉
      console.warn("找不到章節節點", id);
    }
  };

  return (
    <header className="header">
      <button className="menu-btn">☰</button>
      <nav className="chapter-menu">
        {chapters.map((c) => (
          <button key={c.id} onClick={() => handleJump(c.id)}>
            {c.title}
          </button>
        ))}
      </nav>
    </header>
  );
}


小提醒：若 Header 在全站共用，但章節只在 NovelPage 載入後才存在，Header 需要能感知到章節變更（所以用全域 store 很合適）。

如果你要自動偵測 Markdown 標題（當 frontmatter 沒提供 chapters）

有時候你不想手動在 frontmatter 列章節，你可以從 content 用正則或 matchAll 自動抓出 # 標題，例子：

// 在載入 content 後
const headingMatches = Array.from(content.matchAll(/^#{1,3}\s+(.+)$/gm));
const autoChapters = headingMatches.map((m, i) => ({ id: `c${i+1}`, title: m[1].trim() }));
setChapters(autoChapters);


優點：免維護章節 list；缺點：需保證 Markdown 內標題寫法一致（例如都用 # 作章節）。

進階：自動產生 slug id 的套件（選用）

如果不想自己實作 slug，可以使用 remark-slug + rehype-autolink-headings：

import remarkGfm from "remark-gfm";
import remarkSlug from "remark-slug";
import rehypeAutolink from "rehype-autolink-headings";

<ReactMarkdown
  remarkPlugins={[remarkGfm, remarkSlug]}
  rehypePlugins={[[rehypeAutolink, { behavior: "append" }]]}
>
  {content}
</ReactMarkdown>


remark-slug 會自動為 headings 加上 id；rehype-autolink-headings 會自動在標題中加入可點擊的連結符號。

注意：若你在 Markdown 中允許 raw HTML，需要同時使用 rehype-raw 與 rehype-sanitize 做 XSS 防護。

常見陷阱 & 注意事項

frontmatter 與 heading 文本不一致：若 frontmatter 的 chapters[i].title 與 Markdown heading 文字不完全匹配，titleToIdMap.get(text) 可能找不到 id。解法：用 slug 比對（把 heading slug 與 chapter.title slug 比對），或只靠 frontmatter id，不比對文字。

Header 跳轉找不到元素：若 Header 先渲染、Markdown 還沒載入，點擊時找不到元素。解法：等 chapters 設定後才顯示章節選單，或在點擊時檢查是否在當前路由上，若不在則先 navigate 再 scroll。

rehype-raw 有 XSS 風險：避免直接渲染未消毒的 raw HTML；使用 rehype-sanitize 或不要用 rehype-raw。

路由與 hash：你可以用 navigate('/novel/galaxy_dream#c2')，或直接 document.getElementById('c2').scrollIntoView()。hash 的好處是可分享 URL，且瀏覽器會在載入頁面後自動捲到 hash（但若內容是動態載入，可能需要程式處理）。

TypeScript：res.json() 的 any：res.json() 回傳 any，最好用 guard 或轉換型別（如我範例把 parsed.data cast 為 NovelMeta）。

給你的一個完整工作流程建議（步驟）

Markdown 檔加上 frontmatter（包含 chapters 欄位）。

在 NovelPage: fetch md → matter() → setMeta && setContent → setChapters(meta.chapters)。

用 react-markdown 渲染 content，components 或 remark-slug 加入 heading id（以 frontmatter id 對應或用 slug）。

Header 從 store 取得 chapters，點擊用 scrollIntoView 或 navigate 帶 hash。

若要分享 URL，使用 route + hash（需在 NovelPage 載入後檢查 location.hash 並 scroll）。

如果你要，我可以：

幫你把上面範例改成完整的 TypeScript + Zustand store + Header + NovelPage 可執行程式碼檔案（直接貼到你的專案），或

幫你寫一個「當前章節自動高亮（scroll spy）」的範例（會用 IntersectionObserver），或

幫你處理「Header 點章節但不在該小說頁時先 navigate 再自動捲動到章節」的流程細節。

你想先看哪一個完整實作？
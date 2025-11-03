import ThemeList from "../components/ThemeList";
import { useState, useEffect } from "react";
import { ThemeData } from "../types/theme";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [themeData, setThemeData] = useState<ThemeData[]>([]);

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    try {
      const res = await fetch("/data/themes.json");
      if (!res.ok) throw new Error("無法載入主題資料");
      const json = await res.json();
      setThemeData(json);
    } catch (error) {
      alert(`無法載入主題資料:${error}`);
    }
  }

  const navigate = useNavigate();

  const handleTheme = (id: string) => {
    navigate(`/word/${id}`);
  };

  return (
    <>
      <div className="banner"></div>
      <div>
        <p className="theme-slogan">
          You are very much ON TIME, and in your TIME ZONE destiny set up for
          you.
        </p>
      </div>
      <main className="container theme-page">
        {/* {data.map((item) => (
      <ThemeList data1={item}/>
    ))} */}
        {themeData.map((theme) => (
          <div className="theme" key={theme.id}>
            <h5 className="theme-title">{theme.themeName}</h5>
            <div className="jc-center">
              <ul className="theme-ul">
                {theme.themeTitle.map((item, index) => (
                  <li
                    className="theme-list"
                    key={index}
                    onClick={() => handleTheme(item)}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </main>
    </>
  );
}

// // src/pages/HomePage.tsx
// import React, { useEffect, useState } from "react";
// import { ThemeData } from "../types/theme";
// import ThemeList from "../components/ThemeList";

// export default function HomePage() {
//   const [data, setData] = useState<ThemeData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const controller = new AbortController();
//     const signal = controller.signal;

//     async function loadThemes() {
//       try {
//         setLoading(true);
//         setError(null);

//         const res = await fetch("/data/themes.json", { signal });
//         if (!res.ok) {
//           throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
//         }

//         // 解析 JSON
//         const json = await res.json();

//         // 非破壞性的型別檢查（簡單 guard）
//         if (!Array.isArray(json)) {
//           throw new Error("Invalid data format: expected array");
//         }

//         // 可選：更嚴格地檢查每個物件是否有必需屬性
//         const parsed: ThemeData[] = json.map((item) => ({
//           themeName: String(item.themeName ?? ""),
//           themeTitle: Array.isArray(item.themeTitle) ? item.themeTitle.map(String) : [],
//         }));

//         setData(parsed);
//       } catch (err: any) {
//         if (err.name === "AbortError") {
//           // fetch 被取消 — 忽略
//           return;
//         }
//         console.error(err);
//         setError(err.message || "Unknown error");
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadThemes();

//     // 清除副作用：元件卸載時中止 fetch
//     return () => {
//       controller.abort();
//     };
//   }, []);

//   if (loading) {
//     return <div className="p-6">載入中……</div>;
//   }

//   if (error) {
//     return <div className="p-6 text-red-400">載入失敗：{error}</div>;
//   }

//   return (
//     <main className="container theme-page p-6">
//       {/* 你可以傳整個 data 給 ThemeList，也可以逐一 render */}
//       <ThemeList data={data} />
//     </main>
//   );
// }

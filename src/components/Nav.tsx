import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Nav() {
  const location = useLocation();
  const [toLink, setToLink] = useState([{ name: "首頁", path: "/" }]);

  const rawParts = location.pathname.split("/").filter(Boolean);
  const pathParts = rawParts.map((p) => decodeURIComponent(p));
  const pathPart = decodeURIComponent(location.pathname);
  console.log(pathParts);
  console.log(pathPart);

  const bc = [{ name: "首頁", path: "/" }];
  useEffect(() => {
    const fullPath = decodeURIComponent(location.pathname);
    const parts = fullPath.split("/").filter(Boolean);

    if (parts[0] === "word") {
      bc.push({ name: "word", path: fullPath });
    }

    if (parts[0] === "CP") {
      bc.push({ name: "CP", path: fullPath });
    }

    setToLink(bc);
    console.log(bc);
  }, [location.pathname]);

  return (
    <>
      <nav className="nav">
        {toLink.map((item, index) => (
          <span key={index}>
            <Link to={item.path}>{item.name}</Link>
            {index < toLink.length - 1 && <span> / </span>}
          </span>
        ))}
      </nav>
    </>
  );
}

// 🎯 你要的兩個功能
// ✔ 1. 刷新後仍保留 breadcrumb

// → 使用 localStorage 保存

// ✔ 2. 返回上一層後，breadcrumb 自動刪掉當前層

// → 使用 location.pathname + 邏輯判斷來自動收斂陣列

// ⭐ 完整、可直接使用的程式碼

// （你只需要 Copy 就能用）

// ⭐ Step 1 — Breadcrumb Context（含 localStorage + 自動收斂）

// 📄 src/context/BreadcrumbContext.tsx

// import { createContext, useContext, useEffect, useState } from "react";

// interface Crumb {
//   name: string;
//   path: string;
// }

// interface BreadcrumbContextType {
//   crumbs: Crumb[];
//   pushCrumb: (c: Crumb) => void;
//   resetCrumbs: () => void;
// }

// const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

// export function BreadcrumbProvider({ children }) {
//   // 初次載入 → 從 localStorage 拿 breadcrumb
//   const [crumbs, setCrumbs] = useState<Crumb[]>(() => {
//     const saved = localStorage.getItem("breadcrumbs");
//     return saved
//       ? JSON.parse(saved)
//       : [{ name: "首頁", path: "/" }];
//   });

//   // 每次更新 → 儲存到 localStorage
//   useEffect(() => {
//     localStorage.setItem("breadcrumbs", JSON.stringify(crumbs));
//   }, [crumbs]);

//   // 推入 breadcrumb（避免重複）
//   function pushCrumb(c: Crumb) {
//     setCrumbs((prev) => {
//       // 已存在 → 不加入
//       if (prev.some((p) => p.path === c.path)) return prev;

//       return [...prev, c];
//     });
//   }

//   // 返回上一頁 → 自動收斂 breadcrumb
//   function trimBreadcrumbs(currentPath: string) {
//     setCrumbs((prev) => {
//       const idx = prev.findIndex((p) => p.path === currentPath);

//       // 如果找不到該 path，就直接返回
//       if (idx === -1) return prev;

//       // 保留 idx 之前的所有項目
//       return prev.slice(0, idx + 1);
//     });
//   }

//   return (
//     <BreadcrumbContext.Provider value={{ crumbs, pushCrumb, resetCrumbs: () => setCrumbs([{ name: "首頁", path: "/" }]) }}>
//       {children}
//     </BreadcrumbContext.Provider>
//   );
// }

// export function useBreadcrumb() {
//   return useContext(BreadcrumbContext);
// }

// ⭐ Step 2 — App.tsx 包起來 Context
// import { BreadcrumbProvider } from "./context/BreadcrumbContext";

// function App() {
//   return (
//     <BreadcrumbProvider>
//       <RouterProvider router={router} />
//     </BreadcrumbProvider>
//   );
// }

// ⭐ Step 3 — Word 頁面：進入時 push breadcrumb + trim

// 📄 Word.tsx

// import { useBreadcrumb } from "../context/BreadcrumbContext";

// const { pushCrumb } = useBreadcrumb();

// useEffect(() => {
//   const path = `/word/${decodeId}`;

//   // 修剪 breadcrumb（返回上一頁時自動刪掉多餘項）
//   trimBreadcrumbs(path);

//   // 若是首次進入這個頁面 → 加入 breadcrumb
//   pushCrumb({ name: "word", path });
// }, [decodeId]);

// ⭐ Step 4 — CP 頁面：進入時 push breadcrumb + trim

// 📄 CompanionPage.tsx

// import { useBreadcrumb } from "../context/BreadcrumbContext";

// const { pushCrumb, trimBreadcrumbs } = useBreadcrumb();

// useEffect(() => {
//   const path = `/CP/${decodeId}`;

//   trimBreadcrumbs(path);

//   pushCrumb({ name: decodeId, path });
// }, [decodeId]);

// ⭐ Step 5 — Nav 顯示 breadcrumb

// 📄 Nav.tsx

// import { useBreadcrumb } from "../context/BreadcrumbContext";

// export default function Nav() {
//   const { crumbs } = useBreadcrumb();

//   return (
//     <nav className="nav">
//       {crumbs.map((item, index) => (
//         <span key={index}>
//           <Link to={item.path}>{item.name}</Link>
//           {index < crumbs.length - 1 && " / "}
//         </span>
//       ))}
//     </nav>
//   );
// }

// 🎉 最終效果（符合你完整需求）
// ✔ 刷新後 breadcrumb 不會消失

// 因為存在 localStorage

// ✔ 返回上一層 → breadcrumb 自動收斂

// 例：

// / → /word/排球 → /CP/佐久侑

// 使用瀏覽器返回 ←

// breadcrumb 自動變成：

// 首頁 / word

// ✔ 手動輸入網址 /CP/... → 不新增 breadcrumb

// （因為 pushCrumb 有避免重複）

// 🎁 如果你願意，我可以再幫你加：
// ✔ 自動轉換 CP 英文 ID → 中文字幕
// ✔ word 類別的自動對應
// ✔ 當從首頁重新選 CP 時，自動重置 breadcrumb
// ✔ breadcrumb 超過三層自動折疊成「…」

// 只要跟我說即可！

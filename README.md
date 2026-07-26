# Nyarchive

Nyarchive 是一個以 React 製作的個人閱讀資料庫，提供作品分類、清單瀏覽、Markdown 閱讀，並支援靜態網站部署。

本儲存庫公開的是網站程式；內容來源與維護紀錄只保留在本機。

## 功能

- 依主題與作品分類瀏覽收藏內容
- 按需載入文章，避免將所有正文打包進前端程式
- 支援 Markdown、HTML 與 GitHub Flavored Markdown
- 全站密碼驗證，通過後才顯示網站內容
- 可建置為靜態網站並部署至 GitHub Pages

## 技術

- React 18
- TypeScript
- Vite
- React Router
- Sass
- Bootstrap

## 本機執行

先安裝套件：

```bash
npm install
```

啟動開發伺服器：

```bash
npm run dev
```

## 常用指令

```bash
# 啟動本機開發環境
npm run dev

# 執行程式碼檢查
npm run lint

# 建立正式版
npm run build

# 預覽正式版
npm run preview

# 部署 dist 至 GitHub Pages
npm run deploy
```

## 專案結構

```text
src/
├─ api/          # 資料載入
├─ components/   # 共用元件
├─ layouts/      # 頁面版型
├─ pages/        # 主要頁面
├─ router/       # 路由設定
├─ security/     # 密碼工作階段
├─ types/        # TypeScript 型別
└─ utils/        # 共用工具
```

內容資料、翻譯工作檔與本機開發紀錄不屬於公開專案內容。

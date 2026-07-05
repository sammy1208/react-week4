# Nyarchive 開發日誌

最後更新日期：2026-07-05

## 2026-07-05 開發日誌

今天主要處理小說翻譯資料、AO3 匯出檔格式化，以及 Git 上傳前的整理。

### AO3 翻譯與格式整理

依據 `docs/haikyuu-reference.md` 的角色譯名與用語，並依照 `docs/修改手冊.md` 的格式規則，整理多篇 AO3 匯出檔：

- `Dont_hold_me_back.html`
- `just_like_this_so_good.html`
- `Let_me_have_this.html`
- `Like_you_own_me.html`

處理內容：

- 將 AO3 HTML 外殼移除，包括 `DOCTYPE`、`html/head/body`、`style`、`preface`、`afterword` 與留言提示。
- 將作品資訊轉成 frontmatter：
  - `title`
  - `author`
  - `summary`
- 多章作品整理成 `### Chapter N` 搭配 `<!--chapter content-->` 區塊。
- 單章作品整理成 `docs/修改手冊.md` 指定的單章容器格式。
- 保留正文需要的 HTML 結構，例如 `<div>`、`<p>`、`align`。
- 依照排球少年參考資料統一角色名稱：
  - 宮侑
  - 佐久早聖臣
  - 宮治
  - 角名倫太郎
  - 木兔光太郎
  - 日向
  - 古森元也
  - 其他相關角色與隊伍名稱
- 針對機翻常見錯字與殘留英文做後處理。
- 驗證每份檔案沒有殘留 AO3 外殼與 `[待補翻譯]` 標記。

### Git 上傳前整理

- 停止本機正在執行的 `npm run dev` / Vite dev server。
- 在 `.gitignore` 新增 `docs/`，避免翻譯原始檔與工作文件被上傳。
- 使用 `git rm -r --cached docs` 將已被 Git 追蹤的 `docs/` 從索引移除，但保留本機檔案。
- 確認 `docs/` 已被 ignore，未來執行 `git add .` 不會再被重新加入。

### 後續資料整理

- 批次翻譯 `docs/待翻譯` 內 6 篇 AO3 匯出檔，輸出到 `docs/待確認`：
  - `Obedience_tastes_like.md`
  - `Sakusa_Kiyoomis_Routine.md`
  - `Submission_smells_like.md`
  - `the_world_still_is_the.md`
  - `thrill_of_the_hunt.md`
  - `Yer_my_Lifeline.md`
- 新增 `docs/abo-omegaverse-reference.md`，整理歐美同人圈 ABO / Omegaverse 常見設定與翻譯用語。
- 補充 `docs/haikyuu-reference.md` 的佐久侑暱稱規則：
  - `Omi` → `臣`
  - `OmiOmi` / `Omi-Omi` → `臣臣`
- 更新 `docs/修改手冊.md`，新增小說清單 JSON 建立規則：
  - `id` 使用去掉 `【CP】` 後的作品名。
  - `author` 優先填真實作者，找不到才填 `未知`。
  - `tags` 依 `public/data/word.json` 的 `cpKey`。
  - `file` 使用真實存在的 markdown 檔名。
  - `description` 取 frontmatter 的 `summary`。
  - `rating` 固定為 `null`。
- 依最新規則重建 `docs/待確認/list.json`，並確認 6 筆資料都有真實作者、`SakuAtsu` 標籤、真實檔案路徑與摘要描述。
- 修正 `Obedience_tastes_like.md` 摘要翻譯，並同步更新 `list.json` 的 `description`。

### 注意事項

- `docs/` 目前只作為本機工作資料夾，不會上傳到 Git。
- 翻譯檔是機翻後經角色名與格式清理的初稿，若要正式放入站內小說資料，仍建議逐章人工潤稿。
- 下一步上傳前建議再執行：

```bash
npm run build
git status
```

---

## 2026-07-04 開發日誌

## 本次開發重點

這次主要把專案從「頁面各自寫死資料與樣式」整理成比較可維護的結構：

- 首頁、分類頁、文章列表頁改成統一的美術 UI 風格。
- Header、Nav 抽成共用元件。
- 顏色、字級、字體集中管理。
- `themes.json`、`word.json` 擴充成資料集，讓頁面結構和資料邏輯分離。
- 修正 RWD 與圖片顯示細節。

## UI 與切版

### HomePage

- 依照美術圖重切首頁版面。
- 加入主視覺 banner、貓貓書庫標題、分類卡片。
- 使用 `banner02.jpg`、`background01`、`card-frame`、`card-frame-sm` 等視覺素材。
- 將分類卡片 icon 改成資料控制：
  - `book-icon01.png`
  - `book-icon02.png`
  - `book-icon03.png`
- 將右側小書本 icon 改成 `book-icon.png`。
- 調整桌機與手機版 hero 高度，讓貓貓主圖顯示更完整。
- 修正手機版 `card-frame-sm` 顯示與卡片內容排版。

### WordPage

- 依照美術圖重切分類列表頁。
- 加入 breadcrumb、頁面標題、搜尋框、排序按鈕、分類列表卡片。
- 背景統一使用 `background03.png`。
- 調整背景亮度、breadcrumb 字級、標題字體。
- 將列表 icon 從頁面硬編碼整理到 `word.json`。

### CompanionPage

- 依照美術圖重切文章列表頁。
- 加入 breadcrumb、標題區、標籤篩選列、文章列表卡片。
- 移除文章卡片中的時間與「閱讀標籤」資訊。
- `cp-article-card__description` 改成最多顯示兩行。
- 背景改成與 `WordPage` 完全相同。

## 共用元件

### Header

- 確認 `Header.tsx` 透過 `FrontLayout.tsx` 共用在所有頁面。
- 移除首頁專屬 `header--home` 樣式，讓 HomePage、WordPage、CompanionPage 使用同一套 Header 外觀。
- Header 樣式統一由 `src/assets/layout/header.scss` 控制。

### Nav

- 將 HomePage、WordPage、CompanionPage 的 nav/breadcrumb 整理進 `src/components/Nav.tsx`。
- 支援兩種使用場景：
  - `variant="home"`：首頁快速入口。
  - `variant="word"` / `variant="cp"`：麵包屑導覽。
- 將 breadcrumb 樣式統一成 `.ny-breadcrumb`，避免 WordPage 和 CompanionPage 吃不同 CSS。

## 樣式系統整理

### 色票系統

- 重整 `src/assets/base/_color.scss`。
- 建立品牌色與語意色 token：
  - brand green
  - brand gold
  - text
  - background
  - border
  - shadow
  - glow
  - glass effect
- 將 `home.scss`、`wordPage.scss`、`companionPage.scss`、`header.scss`、`footer.scss`、`_glass-effect.scss` 裡的硬編碼顏色改成 CSS variables。

### 字級系統

- 新增 `src/assets/base/_fontsize.scss`。
- 集中管理：
  - font family
  - font size
  - icon size
  - font weight
  - line height
- 將 HomePage、WordPage、CompanionPage、Header、共用 Nav 的字體與字級改成使用 token。
- 在 `src/assets/all.scss` 匯入 `_fontsize.scss`。

## 資料結構整理

### themes.json

將首頁原本寫在 `HomePage.tsx` 裡的資料移到 `public/data/themes.json`：

- `quickLinks`
- `themes`
- 每個 theme 包含：
  - `id`
  - `themeName`
  - `description`
  - `icon`
  - `markIcon`
  - `themeTitle`

### word.json

將分類頁與 CP 頁原本寫死在 TS 裡的資料移到 `public/data/word.json`：

- `tagOrder`
- `words`
- 每個 word 包含：
  - `id`
  - `wordName`
  - `themeId`
  - `themeName`
  - `subtitle`
  - `wordTitle`
- 每個 `wordTitle` 改成物件：
  - `name`
  - `icon`
  - `cpKey`

移除頁面內的硬編碼資料：

- `themeMeta`
- `wordGroupMap`
- `itemIconMap`
- `CP_KEY_MAP`
- `CP_GROUP_MAP`
- `TAG_ORDER`

### TypeScript 型別

更新 `src/types/theme.ts`：

- `ThemeData`
- `ThemeDataset`
- `QuickLinkData`
- `WordData`
- `WordDataset`
- `WordTitleData`
- `NovelsData`

## 驗證紀錄

已執行並通過：

```bash
npm.cmd run lint
npm.cmd run build
```

Build 仍有原本的提醒：

- `/img/background01.jpg` runtime 解析提醒。
- bundle chunk 偏大提醒。

這些不是本次整理造成的錯誤。

## 待辦建議

- 將 `BookPage` 也接上新的資料導覽結構，讓 `/CP/:cpKey/:bookId` 和中文 CP 名稱的路由關係更一致。
- 檢查 `public/img/background01.jpg` 已刪除但 CSS 仍有引用的狀況，決定要改成 `.png` 或補回 `.jpg`。
- 將 README 內舊的亂碼筆記重新整理成正式資料格式規範。

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refre

加密:node encryption.cjs

統一規則（已套用在所有資料）

"id"：作品名（去掉【CP】）

"title"：原始完整標題

"author"： "未知"

"tags"：英文 CP 標籤

"file"：DrStone/<英文 CP>/作品名.md

"description"：""

"rating"：null

{
"id": "作品名稱（去掉【CP】）",
"title": "【CP】作品全名",
"author": "未知",
"tags": ["英文 CP 標籤"],
"file": "DrStone/英文 CP 標籤/安全檔名.md",
"description": "",
"rating": null
}

///
欄位規則（Field Rules）
✔ id

取自作品名稱

去掉前面的【CP 分類】

保留原始文字（包含中文、英文、日文）

例：
【美國組】香菸與鬼 → "id": "香菸與鬼"
【千叉】唯物主义者 → "id": "唯物主义者"

✔ title

保留完整原標題

不可修改

例：
"title": "【千幻】春之宴"

✔ author

一律編寫為：

"author": "未知"

✔ tags

只寫 英文 CP 標籤

不包含 DrStone, CP, 其他多餘資訊

中文 CP 標籤
美國組 "StanXeno"
千叉 "SenXeno"
千幻 "SenGen"
龍羽 "RyuUkyou"
千琥 "SenHaku"
司千 "TsuSen"
多 CP "DrStoneCP"
✔ file（檔案路徑）

格式為：

DrStone/<英文 CP 標籤>/<安全檔名>.md

例如：

DrStone/StanXeno/Stories_of_the_Past.md
DrStone/SenGen/春之宴.md
DrStone/DrStoneCP/輕浮喜劇.md

✔ description

一律為空字串

"description": ""

✔ rating

預設為 null

"rating": null

2️⃣ 安全檔名規則（File Name Safe Rules）

檔名部分比照以下規則：

✔ 1. 空白字元 → 轉成 \_

例：
Set Fire to The Rain → Set_Fire_to_The_Rain.md
You And I → You_And_I.md

✔ 2. 保留中文

香菸與鬼 → 香菸與鬼.md

✔ 3. 英文、日文保留原樣

海の声 → 海の声.md

✔ 4. 不能用的字元 → 轉換為 \_

以下字元若出現，一律替換：

/ \ ? : \* " < > |

✔ 5. 檔名結尾必須加 .md
3️⃣ 分類對應規則（CP → Folder）
中文分類 英文標籤（同時用於 folder 與 tags）
美國組 StanXeno
千叉 SenXeno
千幻 SenGen
龍羽 RyuUkyou
千琥 SenHaku
司千 TsuSen
多 CP DrStoneCP
4️⃣ 完整 JSON 範本（可直接複製）
{
"id": "作品名稱（去掉【CP】）",
"title": "【CP】作品全名",
"author": "未知",
"tags": ["英文 CP 標籤"],
"file": "DrStone/英文 CP 標籤/安全檔名.md",
"description": "",
"rating": null
}

5️⃣ 流程（如何產出一筆作品）

讀取原標題 → 例如：【千幻】春之宴

切出 CP 類型與作品名稱

CP：千幻 → 英文 SenGen

名稱：春之宴 → 作為 id

id = 作品名稱

title = 原標題

author = 未知

tags = [英文標籤]

產出 file

folder = DrStone/SenGen/

filename = 春之宴.md（中文保持不變）

填上 description 與 rating

✔ 完成！

///
世界：Haikyuu

CP 標籤：

黑研: KuroKen
兔赤: BokuAka
青城其他: AobaCP

原始清單：

【黑研】七月之門
【兔赤】落日花火
【青城其他】白鳥澤亂入事件

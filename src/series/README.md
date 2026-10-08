# 系列作品資料

外傳共用 `SeriesStoryPage`（目錄）及 `SeriesChapterPage`（閱讀頁）。
路由分別為 `/series/:seriesId/:storyId` 與 `/series/:seriesId/:storyId/:chapterId`。
作品名稱、簡介、分類及章節順序都由 JSON 提供。

## 新增 Aurelis 外傳

1. 將待歸類的正文移入 `src/novels/Aurelis/<storyId>/`，一章一個 Markdown。
2. 在 `src/series/aurelis/` 新增 `<storyId>.json`，格式見下方。
3. 執行 `npm run encrypt:series`，自動產生外傳入口清單、作品目錄及逐章加密檔。
4. 執行 `npm run build`。新增外傳無須修改頁面、路由、API 或加密腳本。

```json
{
  "id": "new-story",
  "title": "外傳名稱",
  "category": "人物外傳",
  "description": "不含未揭露劇情的作品簡介。",
  "order": 2,
  "chapters": [
    {
      "id": "001",
      "title": "章節名稱",
      "status": "published",
      "sourceFile": "src/novels/Aurelis/new-story/001.md"
    }
  ]
}
```

- 作品檔名須與 `id` 相同；系列、作品、章節 ID 使用小寫英數字及連字號。
- `order` 決定外傳入口順序，省略時為 0；同序號依 ID 排序。章節依 `chapters` 陣列順序閱讀。
- 正文標頭格式沿用現有作品：第一行為 `# 第 001 章｜章節名稱`，接著是以 `> 章節狀態：` 開頭的編輯資料區塊。加密時移除這段編輯標頭；創作稿件的狀態文字不決定網站上架狀態。
- JSON 的 `status: "published"` 表示產生可閱讀的加密正文。為相容既有資料，省略 `status` 時同樣視為 `published`；新增資料建議明確填寫。
- 尚未上架的章節可明確設定 `"status": "pending"`，不需要正文路徑；讀者目錄會顯示該章標題，請只列出允許讀者知道的章名。
- `index.json` 設定系列名稱和正式正文資料夾。其餘 JSON 都會自動視為作品資料，不必額外登錄作品清單。
- `public/data/series/` 和 `public/novels/encrypted/` 為產出檔，請修改來源資料後重新加密。
- `src/novels/` 原文依現有 `.gitignore` 保留在本機。

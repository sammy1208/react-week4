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

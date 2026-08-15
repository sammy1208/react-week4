const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const short = process.argv.includes("--short");
const normalizeExisting = process.argv.includes("--normalize-existing");
const repairResiduals = process.argv.includes("--repair-residuals");
const chapterOption = process.argv.find((arg) => arg.startsWith("--chapters="));
const selectedChapterNumbers = chapterOption
  ? new Set(
      chapterOption
        .slice("--chapters=".length)
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value) && value > 0),
    )
  : null;
const sourceBucket = short ? "10000" : "10000up";
const sourceDir = path.join(rootDir, "docs", "待翻譯", sourceBucket);
const outputDir = path.join(rootDir, "docs", "down", sourceBucket);
const force = process.argv.includes("--force");
const requestedFiles = process.argv
  .slice(2)
  .filter(
    (arg) =>
      arg !== "--force" &&
      arg !== "--short" &&
      arg !== "--normalize-existing" &&
      arg !== "--repair-residuals" &&
      !arg.startsWith("--chapters="),
  );
const pendingFiles = [];
const files = requestedFiles.length > 0 ? requestedFiles : pendingFiles;

const titleMap = {
  "An Elevated Situation": "【佐久侑】電梯困局",
  "can't fight love": "抗拒不了愛",
  "Chant My Name Like A Spell": "像咒語般呼喚我的名字",
  "Cookies & Cream": "餅乾與奶油",
  "Élan": "昂揚",
  "Elephant Gun": "獵象槍",
  "For Duty, For Desire": "為了責任，為了慾望",
  "Just one bite, Alpha.": "咬一口就好，Alpha",
  "Lay Me Down": "讓我躺下",
  "Miya Atsumu's Guide to: What NOT to Do in the Workplace":
    "宮侑指南：職場上絕對不要做的事",
  "My Shy Blond": "我害羞的金髮男孩",
  "on thin ice": "如履薄冰",
  "Sakusa's Secret Admirer": "佐久早的神祕愛慕者",
  "Same Roaches, Different Walls": "相同的蟑螂，不同的牆",
  "Searching for Eternity": "尋找永恆",
  "Secrets We Hunt": "我們所追獵的祕密",
  "shootin' stars & satellites": "流星與衛星",
  "Sonnet of Survival": "生存十四行詩",
  Catcalled: "被搭訕",
  "Coal to Diamond, Sold to Fools": "煤成鑽石，售予愚人",
  "Coffee Talk": "咖啡閒談",
  "Devil’s Advocate": "魔鬼代言人",
  "Dynamics of the Heart": "心之動力學",
  "I (Don't) Want to Keep Secrets Just to Keep You":
    "我（不）願為了留住你而保守祕密",
  "If It Feels Like Love...": "如果這感覺像愛……",
  "I want to feel you in my soul.": "我想在靈魂深處感受你",
  "if fences could talk": "圍籬若能說話",
  mitsuketa: "找到你了",
  "Not so bright": "沒那麼聰明",
  Queen: "女王",
  "the hunt": "狩獵",
  Treasure: "珍寶",
  "Unwrap Me": "拆開我",
  'You Can\'t Spell "Sakusa Kiyoomi" Without "Miya Atsumu"':
    "『佐久早聖臣』少不了『宮侑』",
  "The Ask and the Answer": "提問與回答",
  "The Butterfly Effect": "蝴蝶效應",
  "The Tyrant’s Husband: Royal Heir": "暴君的丈夫：王室繼承人",
  "To Be Yours": "只願屬於你",
};

const sourceNamePairs = [
  ["SakuAtsu", "佐久侑"],
  ["Ojiro Aran", "尾白阿蘭"],
  ["Kita Shinsuke", "北信介"],
  ["Hinata Shouyou", "日向翔陽"],
  ["Ushijima Wakatoshi", "牛島若利"],
  ["Tendou Satori", "天童覺"],
  ["Akaashi Keiji", "赤葦京治"],
  ["Bokuto Koutarou", "木兔光太郎"],
  ["Kageyama Tobio", "影山飛雄"],
  ["Meian Shugo", "明暗修吾"],
  ["Inunaki Shion", "犬鳴志音"],
  ["Iwaizumi Hajime", "岩泉一"],
  ["Oikawa Tooru", "及川徹"],
  ["Akagi Michinari", "赤木路成"],
  ["Ginjima Hitoshi", "銀島結"],
  ["Yachi Hitoka", "谷地仁花"],
  ["Hoshiumi Kourai", "星海光來"],
  ["Yaku Morisuke", "夜久衛輔"],
  ["Kuroo Tetsurou", "黑尾鐵朗"],
  ["Shirofuku Yukie", "白福雪繪"],
  ["Sakusa Kiyoomi", "佐久早聖臣"],
  ["Kiyoomis", "聖臣的"],
  ["Miya Atsumu", "宮侑"],
  ["Miya Osamu", "宮治"],
  ["Suna Rintarou", "角名倫太郎"],
  ["Komori Motoya", "古森元也"],
  ["Sunarin", "倫"],
  ["Kitoomi", "聖臣"],
  ["Kyoomi", "聖臣"],
  ["Kiyomi", "聖臣"],
  ["Kiyoomi", "聖臣"],
  ["Atsmu", "侑"],
  ["Atsumu", "侑"],
  ["Atsu", "阿侑"],
  ["Tsumu", "阿侑"],
  ["Osamu", "治"],
  ["Samu", "阿治"],
  ["Suna", "角名"],
  ["Rintarou", "倫太郎"],
  ["Rintaro", "倫太郎"],
  ["Rin", "倫"],
  ["Motoya", "元也"],
  ["Toya", "元也"],
  ["Ojiro", "尾白"],
  ["Shinsuke", "信介"],
  ["Hinata", "日向"],
  ["Shouyou", "翔陽"],
  ["Shoyo", "翔陽"],
  ["Ushijima", "牛島"],
  ["Wakatoshi", "若利"],
  ["Tendou", "天童"],
  ["Satori", "覺"],
  ["Akaashi", "赤葦"],
  ["Koutarou", "光太郎"],
  ["Kageyama", "影山"],
  ["Tobio", "飛雄"],
  ["Meian", "明暗"],
  ["Shugo", "修吾"],
  ["Inunaki", "犬鳴"],
  ["Shion", "志音"],
  ["Iwaizumi", "岩泉"],
  ["Hajime", "一"],
  ["Oikawa", "及川"],
  ["Tooru", "徹"],
  ["Michinari", "路成"],
  ["Hitoshi", "結"],
  ["Hitoka", "仁花"],
  ["Kourai", "光來"],
  ["Hoshiumi", "星海"],
  ["Yaku", "夜久"],
  ["Morisuke", "衛輔"],
  ["Kuroo", "黑尾"],
  ["Tetsurou", "鐵朗"],
  ["Shirofuku", "白福"],
  ["Primus Pilus", "首席百夫長"],
  ["Centurion", "百夫長"],
  ["Cathradge", "迦太基"],
  ["Atsunu", "侑"],
  ["Yukie", "雪繪"],
  ["OmiOmiOmi", "臣臣臣"],
  ["OmiOmi", "臣臣"],
  ["Omi-Omi", "臣臣"],
  ["Omi", "臣"],
  ["Kiyo", "小臣"],
  ["Sakusa", "佐久早"],
  ["Miya", "宮"],
  ["Bokkun", "木兔君"],
  ["Bokuto", "木兔"],
  ["Keiji", "京治"],
  ["Kita", "北"],
  ["Aran", "阿蘭"],
  ["Akemi", "明美"],
  ["Hiroto", "弘人"],
];

const sourceTermPairs = [
  ["omega kittens", "Omega 貓咪"],
  ["alpha kittens", "Alpha 貓咪"],
  ["beta kittens", "Beta 貓咪"],
  ["catnapping", "綁架貓咪"],
  ["kittens", "貓咪"],
  ["kitten", "貓咪"],
  ["claiming bite", "標記咬痕"],
  ["mating bite", "伴侶咬痕"],
  ["scent blockers", "氣味阻隔劑"],
  ["scent blocker", "氣味阻隔劑"],
  ["scent glands", "氣味腺"],
  ["scent gland", "氣味腺"],
  ["suppressants", "抑制劑"],
  ["suppressant", "抑制劑"],
  ["in heat", "正值發情期"],
  ["heat cycle", "發情週期"],
  ["knotting", "成結"],
  ["nesting", "築巢"],
  ["slick", "滑液"],
  ["knot", "結"],
  ["heat", "發情期"],
  ["nest", "巢"],
  ["pheromones", "費洛蒙"],
  ["pheromone", "費洛蒙"],
  ["Alphas", "Alpha"],
  ["Betas", "Beta"],
  ["Omegas", "Omega"],
  ["Alpha", "Alpha"],
  ["Beta", "Beta"],
  ["Omega", "Omega"],
];

const protectedPairs = [...sourceTermPairs, ...sourceNamePairs];

const translatedCleanupPairs = [
  ["\u4ffa", "我"],
  ["Akemi", "明美"],
  ["Hiroto", "弘人"],
  ["Schweiden Adlers", "施懷登阿德勒"],
  ["Schweiden Adler", "施懷登阿德勒"],
  ["Aoba Johsai", "青葉城西"],
  ["Shiratorizawa", "白鳥澤"],
  ["Inarizaki", "稻荷崎"],
  ["Chibi-chan", "小不點"],
  ["Kumichōs", "組長"],
  ["Kumichō", "組長"],
  ["Johzenji", "條善寺"],
  ["Seijoh", "青城"],
  ["Sejoh", "青城"],
  ["Nohebi", "戶美"],
  ["Nekoma", "音駒"],
  ["Makki", "花卷"],
  ["Mattsun", "松川"],
  ["Tendō", "天童"],
  ["Hirugami", "晝神"],
  ["Shirabu", "白布"],
  ["Semi", "瀨見"],
  ["Daichi", "大地"],
  ["Daishō", "大將"],
  ["夜久za", "黑道"],
  ["板立山", "井闥山"],
  ["板山", "井闥山"],
  ["稻成崎", "稻荷崎"],
  ["宮敦", "宮侑"],
  ["SakuAstu", "佐久侑"],
  ["Saksua", "佐久早"],
  ["Atsumus", "侑的"],
  ["OmiOmiOmi", "臣臣臣"],
  ["Hoshiumi", "星海"],
  ["Yaku", "夜久"],
  ["Miya", "宮"],
  ["宮淳", "宮侑"],
  ["阿津姆", "侑"],
  ["阿茲穆", "侑"],
  ["阿茲姆", "侑"],
  ["阿蘇姆", "侑"],
  ["佐久佐", "佐久早"],
  ["佐久薩", "佐久早"],
  ["清臣", "聖臣"],
  ["清見", "聖臣"],
  ["小見", "臣"],
  ["近江", "臣"],
  ["奧薩姆", "治"],
  ["蘇納", "角名"],
  ["阿斯圖姆", "侑"],
  ["Astumu", "侑"],
  ["Kitashi", "Katashi"],
  ["卡塔什", "Katashi"],
  ["卡塔西", "Katashi"],
  ["卡西", "Katashi"],
  ["Michinari", "路成"],
  ["Hitoshi", "結"],
  ["Hitoka", "仁花"],
  ["Kourai", "光來"],
  ["Black Jackals", "黑狼"],
  ["Tsum-Tsum", "侑侑"],
  ["Kuroo", "黑尾"],
  ["Kuro", "黑尾"],
  ["庫魯", "黑尾"],
  ["Shirofuku", "白福"],
  ["Primus Pilus", "首席百夫長"],
  ["Centurion", "百夫長"],
  ["Cathradge", "迦太基"],
  ["Atsunu", "侑"],
  ["金發女郎", "金髮青年"],
  ["金髮女郎", "金髮青年"],
  ["拉維內特", "黑髮青年"],
  ["拉维内特", "黑髮青年"],
  ["野猪", "野豬"],
  ["金发", "金髮"],
  ["头发", "頭髮"],
  ["每周", "每週"],
  ["一周", "一週"],
  ["干净", "乾淨"],
  ["轻松", "輕鬆"],
  ["尽管", "儘管"],
  ["仿佛", "彷彿"],
  ["回复", "回覆"],
  ["准备", "準備"],
  ["喜欢", "喜歡"],
  ["紋身", "刺青"],
  ["丝带", "絲帶"],
  ["幾奌", "幾點"],
  ["海軍", "肚臍"],
  ["小臣-臣", "聖臣。臣"],
  ["面罩", "口罩"],
  ["麵具", "口罩"],
  ["我会", "我會"],
  ["这", "這"],
  ["么", "麼"],
  ["认", "認"],
  ["触", "觸"],
  ["会", "會"],
  ["并", "並"],
  ["领", "領"],
  ["证", "證"],
  ["获", "獲"],
  ["运", "運"],
  ["哝", "噥"],
  ["赞", "讚"],
  ["脑", "腦"],
  ["响", "響"],
  ["远", "遠"],
  ["内", "內"],
  ["条", "條"],
  ["满", "滿"],
  ["轻", "輕"],
  ["摆", "擺"],
  ["脱", "脫"],
  ["错", "錯"],
  ["车", "車"],
  ["观", "觀"],
  ["静", "靜"],
  ["尽", "儘"],
  ["闭", "閉"],
  ["类", "類"],
  ["连", "連"],
  ["着", "著"],
  ["断", "斷"],
  ["扬", "揚"],
  ["缠", "纏"],
  ["华", "華"],
  ["丽", "麗"],
  ["丝", "絲"],
  ["带", "帶"],
  ["几", "幾"],
  ["须", "須"],
  ["树", "樹"],
  ["卖", "賣"],
  ["饭", "飯"],
  ["电", "電"],
  ["务", "務"],
  ["长", "長"],
  ["约", "約"],
  ["对", "對"],
  ["来", "來"],
  ["个", "個"],
  ["确", "確"],
  ["办", "辦"],
  ["发", "發"],
  ["现", "現"],
  ["当", "當"],
  ["体", "體"],
  ["时", "時"],
  ["头", "頭"],
  ["为", "為"],
  ["们", "們"],
  ["儿", "兒"],
  ["过", "過"],
  ["开", "開"],
  ["关", "關"],
  ["门", "門"],
  ["见", "見"],
  ["实", "實"],
  ["应", "應"],
  ["经", "經"],
  ["样", "樣"],
  ["让", "讓"],
  ["气", "氣"],
  ["点", "點"],
  ["与", "與"],
  ["学", "學"],
  ["国", "國"],
  ["动", "動"],
  ["种", "種"],
  ["进", "進"],
  ["将", "將"],
  ["两", "兩"],
  ["问", "問"],
  ["间", "間"],
  ["虽", "雖"],
  ["却", "卻"],
  ["变", "變"],
  ["该", "該"],
  ["还", "還"],
  ["无", "無"],
  ["爱", "愛"],
  ["读", "讀"],
  ["写", "寫"],
  ["话", "話"],
  ["脸", "臉"],
  ["觉", "覺"],
  ["猪", "豬"],
  ["猫", "貓"],
  ["从", "從"],
  ["里", "裡"],
  ["标", "標"],
  ["记", "記"],
  ["声", "聲"],
  ["说", "說"],
  ["热", "熱"],
  ["颈", "頸"],
  ["边", "邊"],
  ["给", "給"],
  ["阿爾法", "Alpha"],
  ["歐米伽", "Omega"],
  ["歐米茄", "Omega"],
  ["貝塔", "Beta"],
];

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/");
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function prepareSourceText(text) {
  let result = decodeEntities(text).replace(/\s+/g, " ").trim();
  for (let index = 0; index < protectedPairs.length; index += 1) {
    const [from] = protectedPairs[index];
    result = result.replace(
      new RegExp(`\\b${from}\\b`, "gi"),
      `888${String(index).padStart(3, "0")}888`,
    );
  }
  return result;
}

function normalizeChinese(text) {
  let result = text;
  for (let index = 0; index < protectedPairs.length; index += 1) {
    const [, replacement] = protectedPairs[index];
    result = result.replace(
      new RegExp(`888\\s*${String(index).padStart(3, "0")}\\s*888`, "g"),
      replacement,
    );
    result = result.replace(
      new RegExp(`NYAKEEP\\s*${String(index).padStart(3, "0")}\\s*X`, "gi"),
      replacement,
    );
  }
  for (const [from, to] of translatedCleanupPairs) {
    result = result.replace(new RegExp(from, "g"), to);
  }

  return result
    .replace(/\balpha\b/gi, "Alpha")
    .replace(/\bbeta\b/gi, "Beta")
    .replace(/\bomega\b/gi, "Omega")
    .replace(/“/g, "「")
    .replace(/”/g, "」")
    .replace(/‘/g, "『")
    .replace(/’/g, "』")
    .replace(/「\s+/g, "「")
    .replace(/\s+」/g, "」")
    .replace(/\s+([，。！？；：、）])/g, "$1")
    .replace(/([（])\s+/g, "$1")
    .replace(/([。！？])」([，。])/g, "$1」")
    .replace(/([\u3400-\u9fff，。！？；：「」『』（）])\s+/g, "$1")
    .replace(/\s+([\u3400-\u9fff，。！？；：「」『』（）])/g, "$1")
    .trim();
}

function normalizeExistingMarkdown(text) {
  let result = text.replace(/^(title: .*?)(author: )/m, "$1\n$2");

  result = result.replace(
    /(summary: \|\r?\n)([\s\S]*)(---\r?\n\r?\n<!-- translation-stage: draft -->)/,
    (_, start, summary, end) => `${start}${summary.trimEnd()}\n${end}`,
  );
  result = result.replace(
    /^> Notes \/\s*註記>(?=\S)/gm,
    "> Notes / 註記\n>",
  );
  result = result.replace(
    /^> Chapter Notes \/\s*章節註記>(?=\S)/gm,
    "> Chapter Notes / 章節註記\n>",
  );
  result = result.replace(
    /^> Chapter End Notes \/\s*章末註記>(?=\S)/gm,
    "> Chapter End Notes / 章末註記\n>",
  );
  result = result.replace(
    /^(\s*>.*)>[ \t]+$/gm,
    (_, line) => `${line}\n${(line.match(/^\s*/) || [""])[0]}>`,
  );
  result = result.replace(/^(\s*)>(?=\S)/gm, "$1> ");

  for (const [from, to] of translatedCleanupPairs) {
    result = result.replace(new RegExp(from, "g"), to);
  }

  return result
    .replace(/\balpha\b/gi, "Alpha")
    .replace(/\bbeta\b/gi, "Beta")
    .replace(/\bomega\b/gi, "Omega")
    .replace(/“/g, "「")
    .replace(/”/g, "」")
    .replace(/‘/g, "『")
    .replace(/’/g, "』")
    .trim();
}

async function translateRaw(text, retries = 5) {
  if (!text.trim()) return "";

  const params = new URLSearchParams({
    client: "gtx",
    sl: "en",
    tl: "zh-TW",
    dt: "t",
    q: text,
  });

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?${params}`,
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      return json[0].map((item) => item[0]).join("");
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
    }
  }

  return text;
}

function splitHtmlParts(html) {
  return html.split(/(<[^>]+>)/g).map((value) => ({
    type: value.startsWith("<") ? "tag" : "text",
    value,
  }));
}

async function translateTextNodes(textNodes) {
  const translated = new Array(textNodes.length).fill("");
  let batch = [];
  let batchIndexes = [];
  let batchLength = 0;

  async function flush() {
    if (batch.length === 0) return;

    const payload = batch
      .map((text, index) => `${String(index).padStart(6, "0")}|||${text}`)
      .join("\n");
    const result = await translateRaw(payload);
    const pieces = result
      .split(/(\d{6})\s*\|\s*\|\s*\|\s*/)
      .filter((piece) => piece !== "");
    const translatedMap = new Map();

    for (let index = 0; index < pieces.length; index += 2) {
      translatedMap.set(Number(pieces[index]), pieces[index + 1] || "");
    }

    for (let index = 0; index < batch.length; index += 1) {
      const value = translatedMap.get(index);
      if (value === undefined) {
        translated[batchIndexes[index]] = normalizeChinese(
          await translateRaw(batch[index]),
        );
      } else {
        translated[batchIndexes[index]] = normalizeChinese(value);
      }
    }

    batch = [];
    batchIndexes = [];
    batchLength = 0;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  for (let index = 0; index < textNodes.length; index += 1) {
    const prepared = prepareSourceText(textNodes[index]);
    if (!prepared) continue;

    if (batchLength + prepared.length > 1200) await flush();
    batchIndexes.push(index);
    batch.push(prepared);
    batchLength += prepared.length;
  }

  await flush();
  return translated;
}

async function translateHtmlFragment(html) {
  const parts = splitHtmlParts(html);
  const textParts = parts
    .filter((part) => part.type === "text")
    .map((part) => part.value);
  const translatedText = await translateTextNodes(textParts);
  let textIndex = 0;

  return parts
    .map((part) => {
      if (part.type === "tag") return part.value;
      const value = translatedText[textIndex] || "";
      textIndex += 1;
      return value;
    })
    .join("")
    .replace(/<span[^>]*>/g, "")
    .replace(/<\/span>/g, "")
    .replace(/<p>\s*<\/p>/g, "")
    .trim();
}

function extractBlockquoteAfterLabel(html, label) {
  const pattern = new RegExp(
    `<p>${label}<\\/p>\\s*<blockquote class="userstuff">([\\s\\S]*?)<\\/blockquote>`,
  );
  return (html.match(pattern) || [])[1] || "";
}

function extractMeta(source) {
  const title = stripTags(
    (source.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || "",
  );
  const author = stripTags(
    (
      source.match(
        /<div class="byline">by\s+<a[^>]*>([\s\S]*?)<\/a>/,
      ) || []
    )[1] || "未知",
  );
  const summary = extractBlockquoteAfterLabel(source, "Summary");
  const notes = extractBlockquoteAfterLabel(source, "Notes");
  return { title, author, summary, notes };
}

function extractChapters(source) {
  const contentPattern =
    /<!--chapter content-->\s*<div class="userstuff">([\s\S]*?)<\/div>\s*<!--\/chapter content-->/g;
  const matches = [...source.matchAll(contentPattern)];

  if (matches.length === 0) {
    const singleChapter = source.match(
      /<div id="chapters" class="userstuff">\s*<h2 class="toc-heading">([\s\S]*?)<\/h2>\s*<div class="userstuff">([\s\S]*?)<\/div>\s*<\/div>\s*<div id="afterword">/,
    );

    if (!singleChapter) {
      return [];
    }

    const endNotes = (
      source.match(
        /<div id="endnotes">[\s\S]*?<blockquote class="userstuff">([\s\S]*?)<\/blockquote>/,
      ) || []
    )[1] || "";

    return [
      {
        heading: stripTags(singleChapter[1]),
        notes: "",
        content: singleChapter[2],
        endNotes,
      },
    ];
  }

  return matches.map((match, index) => {
    const previousEnd = index === 0 ? 0 : matches[index - 1].index + matches[index - 1][0].length;
    const nextStart = index + 1 < matches.length ? matches[index + 1].index : source.length;
    const before = source.slice(previousEnd, match.index);
    const after = source.slice(match.index + match[0].length, nextStart);
    const headingMatches = [
      ...before.matchAll(/<h2 class="heading">([\s\S]*?)<\/h2>/g),
    ];
    const heading = stripTags(
      headingMatches.length
        ? headingMatches[headingMatches.length - 1][1]
        : `Chapter ${index + 1}`,
    );
    const notes = extractBlockquoteAfterLabel(before, "Chapter Notes");
    const endNotes = (
      after.match(
        /<div class="meta" id="endnotes\d+">[\s\S]*?<blockquote class="userstuff">([\s\S]*?)<\/blockquote>/,
      ) || []
    )[1] || "";

    return {
      heading,
      notes,
      content: match[1],
      endNotes,
    };
  });
}

function blockquoteFromHtml(html) {
  return html
    .replace(/<\/p>\s*<p>/g, "\n\n")
    .replace(/^<p>|<\/p>$/g, "")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .split(/\n/)
    .map((line) => line.trim())
    .map((line) => `> ${line}`)
    .join("\n");
}

function formatBody(html) {
  return html
    .replace(/>\s*</g, ">\n<")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `  ${line}`)
    .join("\n");
}

async function translateFile(fileName) {
  const sourcePath = path.join(sourceDir, fileName);
  const outputPath = path.join(
    outputDir,
    fileName.replace(/\.html$/i, ".md"),
  );

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file does not exist: ${sourcePath}`);
  }
  if ((selectedChapterNumbers || repairResiduals) && !fs.existsSync(outputPath)) {
    throw new Error(`Output does not exist for chapter repair: ${outputPath}`);
  }
  if (
    fs.existsSync(outputPath) &&
    !force &&
    !selectedChapterNumbers &&
    !repairResiduals
  ) {
    throw new Error(`Output already exists: ${outputPath}`);
  }

  const source = fs.readFileSync(sourcePath, "utf8");
  const meta = extractMeta(source);
  const chapters = extractChapters(source);

  if (chapters.length === 0) {
    throw new Error(`No chapter content found in ${fileName}`);
  }

  console.log(`Translating ${fileName}: ${chapters.length} chapters`);

  if (repairResiduals) {
    let existing = fs.readFileSync(outputPath, "utf8");
    const paragraphPattern = /<p(?:\s[^>]*)?>[\s\S]*?<\/p>/g;
    const visibleText = (value) =>
      value
        .replace(/<\/?[A-Za-z][^>]*>/g, " ")
        .replace(/&nbsp;|&#160;|\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const isBroken = (value) => {
      const text = visibleText(value);
      return (
        (text.match(/[A-Za-z]/g) || []).length >= 18 ||
        /KEEP|ZXQ|8{2,3}\d{3,5}8{2,3}|8\d{4,}|\d{4,}8|8[\u3400-\u9fff]{1,4}\d{3}|[\u3400-\u9fff]8[\s\S]{0,80}[\u3400-\u9fff]8{2}|NYA|EP\d|\dX|WKEE|[\uE000-\uF8FF]|\d+[]|\d{6}\s*\|\s*\|\s*\|/.test(text)
      );
    };

    for (let index = 0; index < chapters.length; index += 1) {
      const chapterNumber = index + 1;
      const bodyPattern = new RegExp(
        `(### Chapter ${chapterNumber}\\r?\\n\\r?\\n[\\s\\S]*?<!--chapter content-->\\s*<div>)([\\s\\S]*?)(<\\/div>\\s*<!--\\/chapter content-->)`,
      );
      const outputMatch = existing.match(bodyPattern);
      if (!outputMatch) {
        throw new Error(`Chapter ${chapterNumber} body not found in ${outputPath}`);
      }

      const sourceParagraphs = (
        chapters[index].content.match(paragraphPattern) || []
      ).filter((value) => visibleText(value));
      const outputParagraphs = (outputMatch[2].match(paragraphPattern) || []).filter(
        (value) => visibleText(value),
      );
      if (sourceParagraphs.length !== outputParagraphs.length) {
        console.log(
          `  skipping chapter ${chapterNumber}: paragraph mismatch ${sourceParagraphs.length}/${outputParagraphs.length}`,
        );
        continue;
      }

      const brokenIndexes = [];
      for (let paragraphIndex = 0; paragraphIndex < outputParagraphs.length; paragraphIndex += 1) {
        if (isBroken(outputParagraphs[paragraphIndex])) {
          brokenIndexes.push(paragraphIndex);
        }
      }
      if (brokenIndexes.length === 0) continue;

      console.log(
        `  repairing ${brokenIndexes.length} residual paragraphs in chapter ${chapterNumber}`,
      );
      const sourceSubset = brokenIndexes
        .map((paragraphIndex) => sourceParagraphs[paragraphIndex])
        .join("\n");
      const translatedSubset = await translateHtmlFragment(sourceSubset);
      const translatedParagraphs = translatedSubset.match(paragraphPattern) || [];
      if (translatedParagraphs.length !== brokenIndexes.length) {
        throw new Error(
          `Residual translation mismatch in chapter ${chapterNumber}: ${brokenIndexes.length}/${translatedParagraphs.length}`,
        );
      }

      const replacements = new Map();
      brokenIndexes.forEach((paragraphIndex, replacementIndex) => {
        replacements.set(paragraphIndex, translatedParagraphs[replacementIndex]);
      });
      let visibleIndex = 0;
      const repairedBody = outputMatch[2].replace(paragraphPattern, (paragraph) => {
        if (!visibleText(paragraph)) return paragraph;
        const replacement = replacements.get(visibleIndex);
        visibleIndex += 1;
        return replacement || paragraph;
      });
      existing = existing.replace(
        bodyPattern,
        (_, before, _body, after) => `${before}${repairedBody}${after}`,
      );
    }

    fs.writeFileSync(outputPath, `${existing.trimEnd()}\n`, "utf8");
    console.log(`Repaired residuals in ${path.relative(rootDir, outputPath)}`);
    return;
  }

  if (selectedChapterNumbers) {
    let existing = fs.readFileSync(outputPath, "utf8");

    for (let index = 0; index < chapters.length; index += 1) {
      const chapterNumber = index + 1;
      if (!selectedChapterNumbers.has(chapterNumber)) continue;

      const chapter = chapters[index];
      console.log(`  repairing chapter ${chapterNumber}/${chapters.length}`);
      const translatedChapter = {
        notes: chapter.notes
          ? await translateHtmlFragment(chapter.notes)
          : "",
        content: await translateHtmlFragment(chapter.content),
        endNotes: chapter.endNotes
          ? await translateHtmlFragment(chapter.endNotes)
          : "",
      };
      const block = [`### Chapter ${chapterNumber}`, ""];

      if (translatedChapter.notes) {
        block.push(
          "> Chapter Notes / 章節註記",
          blockquoteFromHtml(translatedChapter.notes),
          "",
        );
      }

      block.push(
        "<!--chapter content-->",
        "<div>",
        formatBody(translatedChapter.content),
        "</div>",
        "<!--/chapter content-->",
        "",
      );

      if (translatedChapter.endNotes) {
        block.push(
          "> Chapter End Notes / 章末註記",
          blockquoteFromHtml(translatedChapter.endNotes),
          "",
        );
      }

      const chapterPattern = new RegExp(
        `### Chapter ${chapterNumber}\\r?\\n\\r?\\n[\\s\\S]*?(?=\\r?\\n### Chapter \\d+\\r?\\n\\r?\\n|$)`,
      );
      if (!chapterPattern.test(existing)) {
        throw new Error(`Chapter ${chapterNumber} block not found in ${outputPath}`);
      }
      existing = existing.replace(chapterPattern, () => block.join("\n").trimEnd());
    }

    fs.writeFileSync(outputPath, `${existing.trimEnd()}\n`, "utf8");
    console.log(`Repaired ${path.relative(rootDir, outputPath)}`);
    return;
  }

  let translatedTitle =
    titleMap[meta.title] || normalizeChinese(await translateRaw(meta.title));
  if (!translatedTitle.startsWith("【")) {
    translatedTitle = `【佐久侑】${translatedTitle}`;
  }
  const translatedSummary = await translateHtmlFragment(meta.summary);
  const translatedNotes = meta.notes
    ? await translateHtmlFragment(meta.notes)
    : "";
  const translatedChapters = [];

  for (let index = 0; index < chapters.length; index += 1) {
    const chapter = chapters[index];
    console.log(`  chapter ${index + 1}/${chapters.length}`);
    translatedChapters.push({
      heading: chapter.heading,
      notes: chapter.notes
        ? await translateHtmlFragment(chapter.notes)
        : "",
      content: await translateHtmlFragment(chapter.content),
      endNotes: chapter.endNotes
        ? await translateHtmlFragment(chapter.endNotes)
        : "",
    });
  }

  const output = [
    "---",
    `title: ${translatedTitle}`,
    `author: ${meta.author}`,
    "summary: |",
    blockquoteFromHtml(translatedSummary)
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n"),
    "---",
    "",
    "<!-- translation-stage: draft -->",
    "",
  ];

  if (translatedNotes) {
    output.push(
      "> Notes / 註記",
      blockquoteFromHtml(translatedNotes),
      "",
    );
  }

  for (let index = 0; index < translatedChapters.length; index += 1) {
    const chapter = translatedChapters[index];
    output.push(`### Chapter ${index + 1}`, "");

    if (chapter.notes) {
      output.push(
        "> Chapter Notes / 章節註記",
        blockquoteFromHtml(chapter.notes),
        "",
      );
    }

    output.push(
      "<!--chapter content-->",
      "<div>",
      formatBody(chapter.content),
      "</div>",
      "<!--/chapter content-->",
      "",
    );

    if (chapter.endNotes) {
      output.push(
        "> Chapter End Notes / 章末註記",
        blockquoteFromHtml(chapter.endNotes),
        "",
      );
    }
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, `${output.join("\n").trim()}\n`, "utf8");
  console.log(`Wrote ${path.relative(rootDir, outputPath)}`);
}

(async () => {
  if (normalizeExisting) {
    for (const file of files) {
      const outputPath = path.join(outputDir, file.replace(/\.html$/i, ".md"));
      if (!fs.existsSync(outputPath)) {
        throw new Error(`Output does not exist: ${outputPath}`);
      }
      const normalized = normalizeExistingMarkdown(
        fs.readFileSync(outputPath, "utf8"),
      );
      fs.writeFileSync(outputPath, `${normalized}\n`, "utf8");
      console.log(`Normalized ${path.relative(rootDir, outputPath)}`);
    }
    return;
  }

  for (const file of files) {
    await translateFile(file);
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "docs", "待翻譯", "10000");
const outputDir = path.join(rootDir, "docs", "down", "10000");

const files = [
  "the_earth.html",
  "The_Edge_of_a_Knife.html",
  "The_games_you_play.html",
  "undesirable.html",
  "Wingman.html",
];

const titleMap = {
  "Devotion": "奉獻",
  "From Eden": "來自伊甸",
  "Guard Dog": "護衛犬",
  "Hazy": "霧濛濛",
  "Little Brother": "弟弟",
};

const namePairs = [
  ["Sakusa Kiyoomi", "佐久早聖臣"],
  ["Miya Atsumu", "宮侑"],
  ["Miya Osamu", "宮治"],
  ["Suna Rintarou", "角名倫太郎"],
  ["Hinata Shouyou", "日向翔陽"],
  ["Bokuto Koutarou", "木兔光太郎"],
  ["Komori Motoya", "古森元也"],
  ["Kiyoomi", "聖臣"],
  ["Atsumu", "侑"],
  ["Tsumu", "阿侑"],
  ["Osamu", "治"],
  ["Samu", "阿治"],
  ["Suna", "角名"],
  ["Rintarou", "倫太郎"],
  ["Motoya", "元也"],
  ["OmiOmi", "臣臣"],
  ["Omi", "臣"],
];

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function cleanSourceText(text) {
  return decodeEntities(text)
    .replace(/\?[\uE000-\uF8FF]/g, '"')
    .replace(/[\uE000-\uF8FF]\?/g, '"')
    .replace(/[\uE000-\uF8FF]/g, "")
    .replace(/\?{2,}/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function normalizeChinese(text) {
  let result = text;

  for (const [from, to] of namePairs) {
    result = result.replace(new RegExp(from, "g"), to);
  }

  const extraPairs = [
    ["宮敦", "宮侑"],
    ["宮淳", "宮侑"],
    ["敦", "侑"],
    ["阿津姆", "侑"],
    ["阿茲穆", "侑"],
    ["佐久佐", "佐久早"],
    ["佐久薩", "佐久早"],
    ["清臣", "聖臣"],
    ["清見", "聖臣"],
    ["小見", "臣"],
    ["歐米", "臣"],
    ["奧薩姆", "治"],
    ["大阪", "治"],
    ["蘇納", "角名"],
  ];

  for (const [from, to] of extraPairs) {
    result = result.replace(new RegExp(from, "g"), to);
  }

  result = result
    .replace(/“/g, "「")
    .replace(/”/g, "」")
    .replace(/『/g, "「")
    .replace(/』/g, "」")
    .replace(/，」/g, "，」")
    .replace(/。\s*」/g, "。」")
    .replace(/\s+([，。！？、」）])/g, "$1")
    .replace(/([「（])\s+/g, "$1");

  return result.trim();
}

function htmlToTextSegments(html) {
  const parts = html.split(/(<[^>]+>)/g);
  return parts.map((part) => {
    if (!part || part.startsWith("<")) return { type: "tag", value: part };
    return { type: "text", value: cleanSourceText(part) };
  });
}

async function translateRaw(text) {
  if (!text.trim()) return "";
  const params = new URLSearchParams({
    client: "gtx",
    sl: "en",
    tl: "zh-TW",
    dt: "t",
    q: text,
  });
  const res = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`);
  if (!res.ok) {
    throw new Error(`Translate failed: ${res.status}`);
  }
  const json = await res.json();
  return json[0].map((item) => item[0]).join("");
}

async function translateSegments(textSegments) {
  const translated = [];
  const batch = [];
  const batchIndexes = [];
  let batchLength = 0;

  async function flush() {
    if (batch.length === 0) return;
    const source = batch.map((text, index) => `<<<NYA_SEG_${index}>>>\n${text}`).join("\n");
    const target = await translateRaw(source);
    const split = target.split(/<<<NYA_SEG_(\d+)>>>\s*/).filter(Boolean);
    const map = new Map();

    for (let i = 0; i < split.length; i += 2) {
      map.set(Number(split[i]), split[i + 1] || "");
    }

    for (let i = 0; i < batch.length; i += 1) {
      translated[batchIndexes[i]] = normalizeChinese(map.get(i) || batch[i]);
    }

    batch.length = 0;
    batchIndexes.length = 0;
    batchLength = 0;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  for (let i = 0; i < textSegments.length; i += 1) {
    const text = textSegments[i];
    if (!text.trim()) {
      translated[i] = "";
      continue;
    }

    if (batchLength + text.length > 3500) {
      await flush();
    }

    batchIndexes.push(i);
    batch.push(text);
    batchLength += text.length;
  }

  await flush();
  return translated;
}

async function translateHtmlFragment(html) {
  const parts = htmlToTextSegments(html);
  const textParts = parts.filter((part) => part.type === "text").map((part) => part.value);
  const translatedText = await translateSegments(textParts);
  let textIndex = 0;

  return parts
    .map((part) => {
      if (part.type === "tag") return part.value;
      const value = translatedText[textIndex] || "";
      textIndex += 1;
      return value;
    })
    .join("")
    .replace(/<p>\s*<\/p>/g, "");
}

function extractMeta(source) {
  const title = stripTags((source.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || "");
  const author = stripTags((source.match(/<div class="byline">by\s+<a[^>]*>([\s\S]*?)<\/a>/) || [])[1] || "未知");
  const summary = (source.match(/<p>Summary<\/p>\s*<blockquote class="userstuff">([\s\S]*?)<\/blockquote>/) || [])[1] || "";
  const notes = (source.match(/<p>Notes<\/p>\s*<blockquote class="userstuff">([\s\S]*?)<\/blockquote>/) || [])[1] || "";
  const endNotes = (source.match(/<div id="afterword">[\s\S]*?<blockquote class="userstuff">([\s\S]*?)<\/blockquote>/) || [])[1] || "";
  const chapter = (source.match(/<div id="chapters" class="userstuff">[\s\S]*?<div class="userstuff">([\s\S]*?)<\/div>\s*<\/div>/) || [])[1] || "";

  return { title, author, summary, notes, endNotes, chapter };
}

function blockquote(text) {
  const lines = text
    .replace(/<\/p>\s*<p>/g, "\n\n")
    .replace(/^<p>|<\/p>$/g, "")
    .replace(/<[^>]+>/g, "")
    .split(/\n+/)
    .map((line) => normalizeChinese(line))
    .filter(Boolean);

  return lines.map((line, index) => (index === 0 ? `  > ${line}` : `  > \n  > ${line}`)).join("\n");
}

async function translateFile(fileName) {
  const sourcePath = path.join(sourceDir, fileName);
  const outputPath = path.join(outputDir, fileName.replace(/\.html$/, ".md"));

  if (fs.existsSync(outputPath)) {
    console.log(`skip existing ${outputPath}`);
    return;
  }

  const source = fs.readFileSync(sourcePath, "utf8");
  const meta = extractMeta(source);
  const translatedTitle = titleMap[meta.title] || normalizeChinese(await translateRaw(meta.title));
  const translatedSummary = await translateHtmlFragment(meta.summary);
  const translatedNotes = meta.notes ? await translateHtmlFragment(meta.notes) : "";
  const translatedChapter = await translateHtmlFragment(meta.chapter);
  const translatedEndNotes = meta.endNotes ? await translateHtmlFragment(meta.endNotes) : "";

  const output = [
    "---",
    `title: ${translatedTitle}`,
    `author: ${meta.author}`,
    "summary: |",
    blockquote(translatedSummary) || "  > ",
    "---",
    "",
    translatedNotes
      ? `> Notes / 註記\n${blockquote(translatedNotes).replace(/^  /gm, "")}\n`
      : "",
    "<div id=\"chapters\" class=\"userstuff\">",
    "  <div class=\"userstuff\">",
    translatedChapter
      .split(/<\/p>/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => `    ${part}</p>`)
      .join("\n\n"),
    "  </div>",
    "</div>",
    "",
    translatedEndNotes
      ? `> End Notes / 後記\n${blockquote(translatedEndNotes).replace(/^  /gm, "")}\n`
      : "",
  ]
    .filter((part) => part !== "")
    .join("\n");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, output, "utf8");
  console.log(`translated ${fileName} -> ${path.relative(rootDir, outputPath)}`);
}

(async () => {
  for (const file of files) {
    await translateFile(file);
  }
})();

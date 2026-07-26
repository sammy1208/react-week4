const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "docs", "待翻譯", "10000up");
const outputDir = path.join(rootDir, "docs", "down", "10000up");
const force = process.argv.includes("--force");
const requestedFiles = process.argv.slice(2).filter((arg) => arg !== "--force");
const pendingFiles = [];
const files = requestedFiles.length > 0 ? requestedFiles : pendingFiles;

const titleMap = {
  "An Elevated Situation": "【佐久侑】電梯困局",
  Catcalled: "被搭訕",
  "Coal to Diamond, Sold to Fools": "煤成鑽石，售予愚人",
  "Coffee Talk": "咖啡閒談",
  "Devil’s Advocate": "魔鬼代言人",
  "Dynamics of the Heart": "心之動力學",
  "I (Don't) Want to Keep Secrets Just to Keep You":
    "我（不）願為了留住你而保守祕密",
  "If It Feels Like Love...": "如果這感覺像愛……",
  "The Ask and the Answer": "提問與回答",
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
  ["宮敦", "宮侑"],
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
  ["幾奌", "幾點"],
  ["海軍", "肚臍"],
  ["小臣-臣", "聖臣。臣"],
  ["面罩", "口罩"],
  ["麵具", "口罩"],
  ["我会", "我會"],
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
      `NYAKEEP${String(index).padStart(3, "0")}X`,
    );
  }
  return result;
}

function normalizeChinese(text) {
  let result = text;
  for (let index = 0; index < protectedPairs.length; index += 1) {
    const [, replacement] = protectedPairs[index];
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

async function translateRaw(text, retries = 3) {
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
      await new Promise((resolve) => setTimeout(resolve, attempt * 600));
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
      .map((text, index) => `<<<NYA_SEG_${index}>>>\n${text}`)
      .join("\n");
    const result = await translateRaw(payload);
    const pieces = result
      .split(/<<<NYA_SEG_(\d+)>>>\s*/)
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

    if (batchLength + prepared.length > 1800) await flush();
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
  return { title, author, summary };
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
  if (fs.existsSync(outputPath) && !force) {
    throw new Error(`Output already exists: ${outputPath}`);
  }

  const source = fs.readFileSync(sourcePath, "utf8");
  const meta = extractMeta(source);
  const chapters = extractChapters(source);

  if (chapters.length === 0) {
    throw new Error(`No chapter content found in ${fileName}`);
  }

  console.log(`Translating ${fileName}: ${chapters.length} chapters`);

  const translatedTitle =
    titleMap[meta.title] || normalizeChinese(await translateRaw(meta.title));
  const translatedSummary = await translateHtmlFragment(meta.summary);
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
  ];

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
  for (const file of files) {
    await translateFile(file);
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

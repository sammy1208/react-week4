const fs = require("fs");
const path = require("path");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertId(id, label) {
  if (typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`${label} 必須是小寫英數字及連字號：${id}`);
  }
}

function assertText(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} 不可為空`);
  }
}

function resolveInside(parent, target) {
  const resolved = fs.realpathSync(target);
  const relative = path.relative(fs.realpathSync(parent), resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`正文路徑必須位於 ${parent} 之內：${target}`);
  }
  return resolved;
}

function stripEditorialHeader(markdown, chapter) {
  const lines = markdown.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").split("\n");
  if (lines[0] !== `# 第 ${chapter.id} 章｜${chapter.title}`) {
    throw new Error(`章節標題不符：${chapter.sourceFile}`);
  }
  let index = 1;
  while (lines[index] === "") index += 1;
  // Publication is controlled by the chapter manifest, not editorial wording.
  if (!/^>\s*章節狀態\s*[：:]/.test(lines[index] ?? "")) {
    throw new Error(`缺少章節編輯標頭：${chapter.sourceFile}`);
  }
  while (lines[index]?.startsWith("> ")) index += 1;
  while (lines[index] === "") index += 1;
  const content = lines.slice(index).join("\n").trim();
  if (!content) throw new Error(`章節正文不可為空：${chapter.sourceFile}`);
  return content;
}

// Each series directory contains index.json plus one data file per story.
// Discover stories from files so adding a story never needs a code change.
function loadSeriesCatalogs(rootDir) {
  const dataRoot = path.join(rootDir, "src", "series");
  if (!fs.existsSync(dataRoot)) return [];

  return fs.readdirSync(dataRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      const seriesId = entry.name;
      assertId(seriesId, "系列代號");
      const directory = path.join(dataRoot, seriesId);
      const series = readJson(path.join(directory, "index.json"));
      assertText(series.title, "系列名稱");
      assertText(series.sourceDirectory, "正文資料夾");
      const sourceDirectory = resolveInside(
        path.join(rootDir, "src", "novels"),
        path.resolve(rootDir, series.sourceDirectory),
      );

      const stories = fs.readdirSync(directory)
        .filter((name) => name.endsWith(".json") && name !== "index.json")
        .sort()
        .map((name) => {
          const story = readJson(path.join(directory, name));
          assertId(story.id, "作品代號");
          if (name !== `${story.id}.json`) throw new Error(`作品檔名與 id 不符：${name}`);
          assertText(story.title, "作品名稱");
          assertText(story.category, "作品分類");
          if (typeof story.description !== "string" || !Array.isArray(story.chapters)) {
            throw new Error(`作品需要 description 與 chapters：${name}`);
          }
          if (story.order !== undefined && !Number.isFinite(story.order)) {
            throw new Error(`作品 order 必須是數字：${name}`);
          }

          const ids = new Set();
          const chapters = story.chapters.map((chapter) => {
            assertId(chapter.id, "章節代號");
            assertText(chapter.title, "章節名稱");
            if (ids.has(chapter.id)) throw new Error(`重複章節代號：${story.id}/${chapter.id}`);
            ids.add(chapter.id);
            const base = { id: chapter.id, title: chapter.title };
            if (chapter.status === "pending") return { ...base, status: "pending" };
            if (chapter.status !== undefined && chapter.status !== "published") {
              throw new Error(`無效的章節狀態：${story.id}/${chapter.id}`);
            }
            assertText(chapter.sourceFile, "正文檔案");
            const sourcePath = resolveInside(sourceDirectory, path.resolve(rootDir, chapter.sourceFile));
            const plaintext = stripEditorialHeader(fs.readFileSync(sourcePath, "utf8"), chapter);
            return { ...base, status: "published", plaintext };
          });

          return {
            id: story.id,
            title: story.title,
            category: story.category,
            description: story.description,
            order: story.order ?? 0,
            chapters,
          };
        })
        .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

      return { id: seriesId, title: series.title, stories };
    });
}

module.exports = { loadSeriesCatalogs, stripEditorialHeader };

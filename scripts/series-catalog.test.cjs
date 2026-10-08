const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { loadSeriesCatalogs } = require("./lib/series-catalog.cjs");

function fixture(t) {
  const prefix = path.join(os.tmpdir(), "nyarchive-series-test-");
  const root = fs.mkdtempSync(prefix);
  t.after(() => {
    const resolved = fs.realpathSync(root);
    const temporaryRoot = fs.realpathSync(os.tmpdir());
    const relative = path.relative(temporaryRoot, resolved);
    assert.ok(relative.startsWith("nyarchive-series-test-") && !relative.includes(path.sep));
    fs.rmSync(resolved, { recursive: true });
  });
  function write(file, value) {
    const destination = path.join(root, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, typeof value === "string" ? value : JSON.stringify(value));
  }
  write("src/series/sample/index.json", { title: "測試系列", sourceDirectory: "src/novels/Sample" });
  fs.mkdirSync(path.join(root, "src/novels/Sample"), { recursive: true });
  function story(id, order = 0) {
    const sourceFile = `src/novels/Sample/${id}/001.md`;
    const data = {
      id, title: id, category: "人物外傳", description: "測試簡介", order,
      chapters: [{ id: "001", title: "測試章節", sourceFile }],
    };
    write(sourceFile, "# 第 001 章｜測試章節\n\n> 章節狀態：正式正史\n> 稿件版本：1\n\n正文測試\n");
    write(`src/series/sample/${id}.json`, data);
    return data;
  }
  return { root, write, story };
}

test("new story data is discovered automatically, ordered, and keeps chapter ids scoped to each story", (t) => {
  const f = fixture(t);
  f.story("first", 2);
  assert.equal(loadSeriesCatalogs(f.root)[0].stories.length, 1);
  f.story("second", 1);
  const [series] = loadSeriesCatalogs(f.root);
  assert.deepEqual(series.stories.map((story) => story.id), ["second", "first"]);
  for (const story of series.stories) {
    assert.equal(story.category, "人物外傳");
    assert.equal(story.description, "測試簡介");
    assert.equal(story.chapters[0].id, "001");
    assert.equal(story.chapters[0].plaintext, "正文測試");
  }
});

test("pending chapters need no source and do not include plaintext", (t) => {
  const f = fixture(t);
  const data = f.story("drafts");
  data.chapters.push({ id: "002", title: "待上架", status: "pending" });
  f.write("src/series/sample/drafts.json", data);
  const chapter = loadSeriesCatalogs(f.root)[0].stories[0].chapters[1];
  assert.deepEqual(chapter, { id: "002", title: "待上架", status: "pending" });
});

test("unaccepted source and duplicate chapter ids are rejected", (t) => {
  const f = fixture(t);
  const data = f.story("validation");
  f.write(data.chapters[0].sourceFile, "# 第 001 章｜測試章節\n\n> 章節狀態：待接受\n\n正文測試");
  assert.throws(() => loadSeriesCatalogs(f.root), /尚未正式接受/);
  f.story("validation");
  data.chapters.push(data.chapters[0]);
  f.write("src/series/sample/validation.json", data);
  assert.throws(() => loadSeriesCatalogs(f.root), /重複章節代號/);
});

test("chapter sources outside the series source folder are rejected", (t) => {
  const f = fixture(t);
  const data = f.story("paths");
  f.write("outside.md", "private text");
  data.chapters[0].sourceFile = "outside.md";
  f.write("src/series/sample/paths.json", data);
  assert.throws(() => loadSeriesCatalogs(f.root), /正文路徑必須位於/);
});

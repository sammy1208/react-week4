const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "src", "data");
const novelsDir = path.join(rootDir, "src", "novels");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toRelative(filePath) {
  return path.relative(rootDir, filePath).replace(/\\/g, "/");
}

function isInside(parent, target) {
  const relative = path.relative(parent, target);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function checkNovelFile(cpFile) {
  const cpPath = path.join(dataDir, cpFile);
  const cpKey = cpFile.replace(/\.json$/, "");
  const items = readJson(cpPath);
  const problems = [];
  const seenIds = new Map();
  let okCount = 0;

  if (!Array.isArray(items)) {
    return {
      cpKey,
      okCount,
      problems: [
        {
          type: "invalid-json-shape",
          message: `${toRelative(cpPath)} must be an array.`,
        },
      ],
    };
  }

  for (const [index, item] of items.entries()) {
    const label = item?.title || item?.id || `#${index + 1}`;

    if (!item?.id) {
      problems.push({
        type: "missing-id",
        message: `${label} is missing id.`,
      });
    } else if (seenIds.has(item.id)) {
      problems.push({
        type: "duplicate-id",
        message: `${label} has duplicate id "${item.id}" also used by ${seenIds.get(item.id)}.`,
      });
    } else {
      seenIds.set(item.id, label);
    }

    if (!item?.file) {
      problems.push({
        type: "missing-file",
        message: `${label} is missing file.`,
      });
      continue;
    }

    if (!item.file.endsWith(".md")) {
      problems.push({
        type: "invalid-extension",
        message: `${label} file should end with .md: ${item.file}`,
      });
    }

    const novelPath = path.resolve(novelsDir, item.file);

    if (!isInside(novelsDir, novelPath)) {
      problems.push({
        type: "invalid-path",
        message: `${label} points outside src/novels: ${item.file}`,
      });
      continue;
    }

    if (!fs.existsSync(novelPath)) {
      problems.push({
        type: "missing-md",
        message: `${label} -> ${toRelative(novelPath)}`,
      });
      continue;
    }

    okCount += 1;
  }

  return { cpKey, okCount, problems };
}

function main() {
  const cpFiles = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  const reports = cpFiles.map(checkNovelFile);
  const problemReports = reports.filter((report) => report.problems.length > 0);
  const totalOk = reports.reduce((sum, report) => sum + report.okCount, 0);
  const totalProblems = reports.reduce((sum, report) => sum + report.problems.length, 0);

  console.log("Novel integrity check");
  console.log(`- CP files: ${reports.length}`);
  console.log(`- Existing markdown entries: ${totalOk}`);
  console.log(`- Problems: ${totalProblems}`);

  if (problemReports.length === 0) {
    console.log("\nAll novel entries are valid.");
    return;
  }

  for (const report of problemReports) {
    console.log(`\n${report.cpKey}`);

    const grouped = report.problems.reduce((groups, problem) => {
      groups[problem.type] ||= [];
      groups[problem.type].push(problem.message);
      return groups;
    }, {});

    for (const [type, messages] of Object.entries(grouped)) {
      console.log(`  ${type}: ${messages.length}`);
      for (const message of messages) {
        console.log(`    - ${message}`);
      }
    }
  }

  process.exitCode = 1;
}

main();

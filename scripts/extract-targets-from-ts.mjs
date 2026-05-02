/**
 * Legacy helper: extract defaultTargetLists / defaultUniversityTargetLists from an OLD
 * lib/resume-builder/targets.ts backup (before defaults moved to content/defaults/*.json).
 *
 * Usage: node scripts/extract-targets-from-ts.mjs [path-to-targets.ts]
 * Default path: lib/resume-builder/targets.ts (will fail if arrays were removed).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const tsPath = path.resolve(root, process.argv[2] ?? path.join("lib", "resume-builder", "targets.ts"));
const outDir = path.join(root, "content", "defaults");

function extractBracketArray(source, startIdx) {
  let i = source.indexOf("[", startIdx);
  if (i === -1) throw new Error("Expected [ after marker");
  let depth = 0;
  const start = i;
  for (; i < source.length; i++) {
    const c = source[i];
    if (c === '"' || c === "'") {
      const quote = c;
      i++;
      while (i < source.length) {
        if (source[i] === "\\") {
          i += 2;
          continue;
        }
        if (source[i] === quote) break;
        i++;
      }
      continue;
    }
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error("Unbalanced brackets");
}

function stripTrailingCommas(jsonLike) {
  return jsonLike.replace(/,(\s*[\]}])/g, "$1");
}

function markerIndex(source, marker) {
  const idx = source.indexOf(marker);
  if (idx === -1) throw new Error(`Marker not found: ${marker}`);
  return idx + marker.length;
}

const text = fs.readFileSync(tsPath, "utf8");

const workMarker = "const defaultTargetLists: Array<{ country: string; targets: ResumeTarget[] }> = ";
const uniMarker = "const defaultUniversityTargetLists: Array<{ country: string; field: string; targets: ResumeTarget[] }> = ";

const workRaw = extractBracketArray(text, markerIndex(text, workMarker));
const uniRaw = extractBracketArray(text, markerIndex(text, uniMarker));

for (const [name, raw] of [
  ["work-targets.json", workRaw],
  ["university-targets.json", uniRaw]
]) {
  const parsed = new Function(`return ${stripTrailingCommas(raw)}`)();
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  console.log("Wrote", path.join(outDir, name));
}

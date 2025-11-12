// utils/convert.js
// Lightweight heuristics to turn a free-form GPT prompt into clean Markdown.
//
// Features:
// - Optional YAML front matter (can be toggled in Options)
// - Auto title detection (first non-empty line -> H1)
// - Normalizes bullet and numbered lists
// - Converts "Key: Value" into bolded term + value
// - Creates fenced code blocks for lines tagged as code or containing {json}
// - Preserves blank lines carefully
// - Escapes Markdown-reserved characters where helpful

function getOptions() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        enableFrontMatter: true,
        defaultTags: "gpt,prompt,markdown",
        defaultAuthor: "You",
        autoTitle: true
      },
      resolve
    );
  });
}

function escapePipes(s) {
  return s.replace(/\|/g, "\\|");
}

function looksLikeNumberedList(line) {
  return /^\s*\d+[\)\.\-]\s+/.test(line);
}

function looksLikeBullet(line) {
  return /^\s*[\-\*\u2022]\s+/.test(line);
}

function normalizeBullet(line) {
  // Replace different bullet styles with "- "
  return line.replace(/^\s*[\-\*\u2022]\s+/, "- ");
}

function normalizeNumbered(line) {
  // Normalize to "1. "
  return line.replace(/^\s*\d+[\)\.\-]\s+/, "1. ");
}

function isKVPair(line) {
  // Key: Value
  return /^\s*[^:]+:\s+.+$/.test(line);
}

function kvToBold(line) {
  const idx = line.indexOf(":");
  if (idx === -1) return line;
  const key = line.slice(0, idx).trim();
  const val = line.slice(idx + 1).trim();
  return `**${key}**: ${val}`;
}

function maybeFenceCode(lines) {
  // Simple heuristic: if a block starts with ``` we keep it;
  // If we detect JSON-like object on a single line, fence it.
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*({.*}|\\[.*\\])\s*$/.test(l)) {
      out.push("```json");
      out.push(l);
      out.push("```");
    } else {
      out.push(l);
    }
  }
  return out;
}

function detectTitle(lines, autoTitle) {
  if (!autoTitle) return { title: null, rest: lines };
  for (let i = 0; i < lines.length; i++) {
    const candidate = lines[i].trim();
    if (candidate.length > 0) {
      // Use as title and drop it from body
      const newLines = lines.slice(0, i).concat(lines.slice(i + 1));
      return { title: candidate.replace(/^#+\s*/, ""), rest: newLines };
    }
  }
  return { title: null, rest: lines };
}

export async function toMarkdown(raw) {
  const opt = await getOptions();
  const lines = raw.replace(/\r\n/g, "\n").split("\n");

  const { title, rest } = detectTitle(lines, opt.autoTitle);

  // Transform lines
  let transformed = rest.map(l => {
    if (looksLikeBullet(l)) return normalizeBullet(l);
    if (looksLikeNumberedList(l)) return normalizeNumbered(l);
    if (isKVPair(l)) return kvToBold(l);
    return escapePipes(l);
  });

  transformed = maybeFenceCode(transformed);

  // Trim trailing blank lines
  while (transformed.length && transformed[transformed.length - 1].trim() === "") {
    transformed.pop();
  }

  // Compose
  const md = [];
  if (opt.enableFrontMatter) {
    const date = new Date().toISOString();
    md.push("---");
    md.push(`title: "${title || "Untitled Prompt"}"`);
    md.push(`author: "${opt.defaultAuthor}"`);
    md.push(`tags: [${opt.defaultTags.split(",").map(t => `"${t.trim()}"`).join(", ")}]`);
    md.push(`created: "${date}"`);
    md.push("---", "");
  } else if (title) {
    md.push(`# ${title}`, "");
  }

  md.push(...transformed);

  return md.join("\n");
}

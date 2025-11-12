
const input = document.getElementById('input');
const output = document.getElementById('output');
const convertBtn = document.getElementById('convert');
const copyBtn = document.getElementById('copy');
const openOptions = document.getElementById('openOptions');
const wrapMarkdownEl = document.getElementById('wrapMarkdown');

const defaultTemplate = {
  role: "system",
  framework: {
    objective: "Structure the user's prompt into a machine-parseable plan for a GPT assistant.",
    fields: ["title", "task", "intent", "audience", "language", "inputs", "components", "output", "metadata"]
  }
};

chrome.storage.sync.get(["schemaTemplate", "wrapMarkdown"], (res) => {
  wrapMarkdownEl.checked = !!res.wrapMarkdown;
  if (!res.schemaTemplate) {
    chrome.storage.sync.set({ schemaTemplate: defaultTemplate });
  }
});

openOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());

convertBtn.addEventListener('click', async () => {
  const raw = input.value.trim();
  if (!raw) return;
  const { schemaTemplate, wrapMarkdown } = await chrome.storage.sync.get(["schemaTemplate", "wrapMarkdown"]);
  const jsonObj = convert(raw, schemaTemplate);
  const jsonStr = JSON.stringify(jsonObj, null, 2);
  output.value = wrapMarkdown ? `\`\`\`json\n${jsonStr}\n\`\`\`` : jsonStr;
});

copyBtn.addEventListener('click', async () => {
  const text = output.value.trim();
  if (!text) return;
  await navigator.clipboard.writeText(text);
  copyBtn.textContent = "Copied!";
  setTimeout(() => copyBtn.textContent = "Copy", 800);
});

function convert(prompt, template){
  const lines = prompt.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const title = lines[0] || "Prompt";
  const bullets = lines.filter(l => /^[-*•]/.test(l)).map(l => l.replace(/^[-*•]\s?/, ""));
  const numbered = lines.filter(l => /^\d+[\).]/.test(l)).map(l => l.replace(/^\d+[\).]\s?/, ""));
  const constraints = lines.filter(l => /\b(must|do not|avoid|limit|within|no more than|exactly)\b/i.test(l));
  const codeHints = /\b(code|snippet|function|class|regex|pseudocode|json|yaml|markdown)\b/i.test(prompt);
  const languageMatch = prompt.match(/\b(english|malay|bahasa melayu|bm|en)\b/i);
  const language = languageMatch ? languageMatch[0] : null;
  const audienceMatch = prompt.match(/\b(student|expert|beginner|manager|client|engineer|developer|lecturer|examiner)s?\b/i);

  const obj = {
    title,
    task: "Convert natural-language prompt into a structured instruction set for a GPT-style assistant.",
    intent: "Generate a clear, reproducible, and machine-parseable specification of the user's ask.",
    audience: audienceMatch ? audienceMatch[0] : "general",
    language: language,
    inputs: {
      raw_prompt: prompt
    },
    components: {
      steps: numbered,
      bullet_points: bullets,
      constraints,
      key_terms: Array.from(new Set(prompt.match(/[A-Za-z0-9_#.+-]{3,}/g) || [])).slice(0, 20)
    },
    output: {
      expected_formats: ["json"],
      include_code: codeHints,
      quality: ["clear", "concise", "complete"]
    },
    metadata: {
      created_at: new Date().toISOString()
    }
  };
  if (template && typeof template === "object") return Object.assign({}, template, obj);
  return obj;
}


// Injected by background via scripting: converts selection or focused textarea and copies JSON
(async () => {
  const getOptions = () => new Promise((resolve) => {
    chrome.storage.sync.get(["schemaTemplate", "wrapMarkdown"], (res) => resolve(res));
  });

  const { schemaTemplate, wrapMarkdown } = await getOptions();

  const getFocusedEditable = () => {
    const el = document.activeElement;
    if (!el) return null;
    const tag = el.tagName?.toLowerCase();
    const contentEditable = el.getAttribute && el.getAttribute("contenteditable");
    if (tag === "textarea" || tag === "input") return el;
    if (contentEditable === "" || contentEditable === "true") return el;
    return null;
  };

  const getSelectedText = () => window.getSelection()?.toString() || "";

  const sourceText = (getSelectedText() || getFocusedEditable()?.value || getFocusedEditable()?.innerText || "").trim();
  if (!sourceText) {
    alert("Prompt → JSON: No text selected or focused.");
    return;
  }

  const jsonObj = window.__PROMPT_TO_JSON__?.convert(sourceText, schemaTemplate) || defaultConvert(sourceText, schemaTemplate);

  const jsonStr = JSON.stringify(jsonObj, null, 2);
  const finalStr = wrapMarkdown ? "```json\n" + jsonStr + "\n```" : jsonStr;

  try {
    await navigator.clipboard.writeText(finalStr);
    notify("Converted to JSON and copied to clipboard.");
  } catch (e) {
    console.warn("Clipboard failed, showing modal instead.", e);
    showModal(finalStr);
  }

  function notify(message) {
    const n = document.createElement("div");
    n.textContent = message;
    n.style.cssText = "position:fixed;top:16px;right:16px;z-index:999999;padding:10px 14px;background:#0b5; color:#fff; border-radius:8px; font-family:system-ui, sans-serif; box-shadow:0 4px 12px rgba(0,0,0,.15)";
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 1800);
  }

  function showModal(text) {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999998";
    const modal = document.createElement("div");
    modal.style.cssText = "position:fixed;top:10%;left:50%;transform:translateX(-50%);width:min(800px,90vw);background:#fff;border-radius:10px;padding:18px;z-index:999999;font-family:system-ui, sans-serif;";
    const h = document.createElement("div");
    h.textContent = "Prompt → JSON";
    h.style.cssText = "font-weight:700;margin-bottom:8px";
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "width:100%;height:360px;border:1px solid #ddd;border-radius:8px;padding:10px;font-family:ui-monospace,Menlo,Consolas,monospace;";
    const row = document.createElement("div");
    row.style.cssText = "margin-top:10px;display:flex;gap:8px;justify-content:flex-end";
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.onclick = async () => { await navigator.clipboard.writeText(text); close(); };
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.onclick = () => close();
    [copyBtn, closeBtn].forEach(b => b.style.cssText = "padding:8px 12px;border:1px solid #ccc;border-radius:8px;background:#f7f7f7;cursor:pointer");
    row.append(copyBtn, closeBtn);
    modal.append(h, ta, row);
    overlay.append(modal);
    document.body.append(overlay);
    function close(){ overlay.remove(); }
  }

  function defaultConvert(prompt, template) {
    // Heuristic parser: try to capture title, language, numbered steps, bullets, constraints
    const lines = prompt.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const title = lines[0] || "Prompt";
    const bullets = lines.filter(l => /^[-*•]/.test(l)).map(l => l.replace(/^[-*•]\s?/, ""));
    const numbered = lines.filter(l => /^\d+[\).]/.test(l)).map(l => l.replace(/^\d+[\).]\s?/, ""));
    const constraints = lines.filter(l => /\b(must|do not|avoid|limit|within|no more than|exactly)\b/i.test(l));
    const codeHints = /\b(code|snippet|function|class|regex|pseudocode|json|yaml|markdown)\b/i.test(prompt);
    const languageMatch = prompt.match(/\b(english|malay|bahasa melayu|bm|en)\b/i);
    const language = languageMatch ? languageMatch[0] : null;
    const outputs = [];
    if (/diagram|table|checklist/i.test(prompt)) outputs.push("diagram/table/checklist");
    if (/json/i.test(prompt)) outputs.push("json");
    if (/markdown|md\b/i.test(prompt)) outputs.push("markdown");
    if (/pdf/i.test(prompt)) outputs.push("pdf");
    const audienceMatch = prompt.match(/\b(student|expert|beginner|manager|client|engineer|developer|lecturer|examiner)s?\b/i);

    const base = {
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
        expected_formats: outputs.length ? outputs : ["json"],
        include_code: codeHints,
        quality: ["clear", "concise", "complete"]
      },
      metadata: {
        created_at: new Date().toISOString()
      }
    };

    if (template && typeof template === "object") {
      // Shallow merge user template
      return Object.assign({}, template, base);
    }
    return base;
  }
})();

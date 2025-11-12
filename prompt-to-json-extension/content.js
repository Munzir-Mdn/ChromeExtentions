
// content.js - injects a small floating button on editable areas
(function(){
  let btn;
  const styles = "position:fixed;z-index:999999;padding:8px 10px;border-radius:999px;background:#111;color:#fff;font:600 12px system-ui, sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.2);cursor:pointer;display:none;";
  function ensureBtn() {
    if (btn) return btn;
    btn = document.createElement("button");
    btn.textContent = "→ JSON";
    btn.setAttribute("aria-label", "Convert prompt to JSON");
    btn.style.cssText = styles;
    btn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "RUN_CONVERTER" });
    });
    document.documentElement.appendChild(btn);
    return btn;
  }

  function placeBtnNear(el) {
    const r = el.getBoundingClientRect();
    const x = r.right - 60;
    const y = r.bottom - 36;
    const b = ensureBtn();
    b.style.left = Math.max(8, x) + "px";
    b.style.top = Math.max(8, y) + "px";
    b.style.display = "block";
  }

  document.addEventListener("focusin", (e) => {
    const t = e.target;
    if (!t) return;
    const tag = t.tagName?.toLowerCase();
    const isEditable = (tag === "textarea" || tag === "input" || t.isContentEditable);
    if (isEditable) placeBtnNear(t);
  });

  document.addEventListener("scroll", () => {
    if (document.activeElement) placeBtnNear(document.activeElement);
  }, true);

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "HIDE_BUTTON" && btn) btn.style.display = "none";
  });

  // Load a small converter helper on page to be used by scripting
  window.__PROMPT_TO_JSON__ = {
    convert(text, template) {
      // Same heuristic as in page_converter.js but kept minimal here for reuse if needed
      const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      const title = lines[0] || "Prompt";
      const bullets = lines.filter(l => /^[-*•]/.test(l)).map(l => l.replace(/^[-*•]\s?/, ""));
      const numbered = lines.filter(l => /^\d+[\).]/.test(l)).map(l => l.replace(/^\d+[\).]\s?/, ""));
      const constraints = lines.filter(l => /\b(must|do not|avoid|limit|within|no more than|exactly)\b/i.test(l));
      const out = {
        title,
        inputs: { raw_prompt: text },
        components: { steps: numbered, bullet_points: bullets, constraints },
        output: { expected_formats: ["json"] }
      };
      if (template && typeof template === "object") Object.assign(out, template);
      return out;
    }
  };

  // When the floating button is clicked, ask background to run converter in-page
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "RUN_CONVERTER") {
      chrome.runtime.sendMessage({ type: "RUN_CONVERTER" });
    }
  });
})();

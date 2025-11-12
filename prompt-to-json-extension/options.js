
const templateEl = document.getElementById('template');
const saveBtn = document.getElementById('save');
const restoreBtn = document.getElementById('restore');
const wrapMarkdownEl = document.getElementById('wrapMarkdown');

const defaultTemplate = {
  role: "system",
  framework: {
    objective: "Structure the user's prompt into a machine-parseable plan for a GPT assistant.",
    fields: ["title", "task", "intent", "audience", "language", "inputs", "components", "output", "metadata"]
  }
};

function load() {
  chrome.storage.sync.get(["schemaTemplate", "wrapMarkdown"], ({schemaTemplate, wrapMarkdown}) => {
    templateEl.value = JSON.stringify(schemaTemplate || defaultTemplate, null, 2);
    wrapMarkdownEl.checked = !!wrapMarkdown;
  });
}
load();

saveBtn.addEventListener('click', () => {
  try {
    const parsed = JSON.parse(templateEl.value);
    chrome.storage.sync.set({ schemaTemplate: parsed, wrapMarkdown: wrapMarkdownEl.checked });
    saveBtn.textContent = "Saved!";
    setTimeout(() => saveBtn.textContent = "Save", 800);
  } catch (e) {
    alert("Invalid JSON in template: " + e.message);
  }
});

restoreBtn.addEventListener('click', () => {
  templateEl.value = JSON.stringify(defaultTemplate, null, 2);
});

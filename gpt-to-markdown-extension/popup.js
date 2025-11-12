import { toMarkdown } from "./utils/convert.js";

const $ = (s)=>document.querySelector(s);
const input = $("#input");
const output = $("#output");
const btnConvert = $("#convert");
const btnCopy = $("#copy");
const btnDownload = $("#download");

async function loadLastSelection() {
  chrome.storage.local.get(["lastInput"], (res) => {
    if (res.lastInput) {
      input.value = res.lastInput;
      chrome.storage.local.remove(["lastInput"]);
      convertNow();
    }
  });
}

async function convertNow() {
  const raw = input.value || "";
  const md = await toMarkdown(raw);
  output.value = md;
}

btnConvert.addEventListener("click", convertNow);

btnCopy.addEventListener("click", async () => {
  if (!output.value) await convertNow();
  await navigator.clipboard.writeText(output.value);
  btnCopy.textContent = "Copied!";
  setTimeout(()=> btnCopy.textContent = "Copy .md", 1200);
});

btnDownload.addEventListener("click", async () => {
  if (!output.value) await convertNow();
  const blob = new Blob([output.value], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeTitle = (output.value.match(/^title:\s*"(.*)"/m)?.[1] || "prompt").replace(/[^\w\-]+/g, "_");
  a.href = url;
  a.download = `${safeTitle}.md`;
  a.click();
  URL.revokeObjectURL(url);
});

document.addEventListener("DOMContentLoaded", async () => {
  await loadLastSelection();
});

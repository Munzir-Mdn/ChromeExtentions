const $ = (s)=>document.querySelector(s);

function restore() {
  chrome.storage.sync.get(
    { enableFrontMatter: true, defaultTags: "gpt,prompt,markdown", defaultAuthor: "You", autoTitle: true },
    (items)=>{
      $("#enableFrontMatter").checked = items.enableFrontMatter;
      $("#defaultTags").value = items.defaultTags;
      $("#defaultAuthor").value = items.defaultAuthor;
      $("#autoTitle").checked = items.autoTitle;
    }
  );
}

function save() {
  const payload = {
    enableFrontMatter: $("#enableFrontMatter").checked,
    defaultTags: $("#defaultTags").value.trim() || "gpt,prompt,markdown",
    defaultAuthor: $("#defaultAuthor").value.trim() || "You",
    autoTitle: $("#autoTitle").checked
  };
  chrome.storage.sync.set(payload, ()=>{
    $("#status").textContent = "Saved";
    setTimeout(()=> $("#status").textContent = "", 1200);
  });
}

document.addEventListener("DOMContentLoaded", restore);
$("#save").addEventListener("click", save);

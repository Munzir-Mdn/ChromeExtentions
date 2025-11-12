// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convertToMarkdown",
    title: "Convert selection to Markdown (.md)",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "convertToMarkdown" && info.selectionText) {
    const text = info.selectionText;
    chrome.storage.local.set({ lastInput: text }, () => {
      chrome.action.openPopup(); // open the popup to show conversion
    });
  }
});

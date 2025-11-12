
// background.js - registers context menu and handles keyboard command
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convertToJSON",
    title: "Prompt → JSON",
    contexts: ["selection", "editable"]
  });
});

// Convert function that runs in the page via scripting
async function convertInPage(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["page_converter.js"]
    });
  } catch (e) {
    console.error("Scripting error:", e);
  }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "convertToJSON" && tab && tab.id) {
    convertInPage(tab.id);
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "convert_prompt_to_json") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]?.id) convertInPage(tabs[0].id);
    });
  }
});

const apiEl=document.getElementById('apiKey');
document.getElementById('save').addEventListener('click',async()=>{await chrome.storage.sync.set({apiKey:apiEl.value});alert('Saved.')});
document.getElementById('clear').addEventListener('click',async()=>{await chrome.storage.sync.remove('apiKey');apiEl.value='';alert('Cleared.')});
(async()=>{const {apiKey}=await chrome.storage.sync.get(['apiKey']);apiEl.value=apiKey||''})();

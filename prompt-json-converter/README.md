# Prompt ⇄ JSON Converter (Chrome Extension)

Convert any GPT-style prompt into structured JSON and back into a clean, human-readable prompt.

## Features
- **Offline (heuristic) mode**: Robust heading and bullet parsing for Role, Task, Inputs, Constraints, Steps, etc.
- **AI mode (optional)**: Use your OpenAI API key to get higher-fidelity conversions.
- **Schemas**: `default`, `task`, `cvjd` out of the box — add your own easily.
- **Quick copy & download** buttons.

## Install (Developer Mode)
1. Download the ZIP and extract it.
2. Go to `chrome://extensions` → enable **Developer mode** (top-right).
3. Click **Load unpacked** and select the extracted folder.

## Use
1. Click the extension icon.
2. Paste either a prompt or a JSON object into **Input**.
3. Choose a **Schema** (for Prompt → JSON) and click **To JSON**, or click **To Prompt** (for JSON → Prompt).
4. Optional: switch to **AI** tab, set your API key in Options, and use **Run AI**.

## Security & Privacy
- Your API key (if used) is saved in `chrome.storage.sync`.
- No analytics, no external calls in heuristic mode.

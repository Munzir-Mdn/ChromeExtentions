
# Prompt → JSON (Chrome Extension)

Convert any natural-language prompt into a structured JSON format. Works via popup, context menu, keyboard shortcut (Alt+J), or a floating "→ JSON" button near focused textareas.

## Features
- **Popup UI:** paste prompt, convert, copy.
- **Context Menu:** right-click selected text or inside any editable field.
- **Shortcut:** press **Alt+J**.
- **Floating Button:** appears near focused textareas.
- **Custom Schema:** edit the base JSON in Options.
- **Markdown fences:** optional ```json wrapping.

## Install (Developer Mode)
1. Go to **chrome://extensions**.
2. Toggle **Developer mode** (top right).
3. Click **Load unpacked** and select this folder.
4. Pin the extension for quick access.

## Use
- Popup: click the extension icon → paste prompt → **Convert**.
- On a page: select text or focus a textarea, then **right-click → Prompt → JSON** or press **Alt+J**.
- The result is copied to clipboard. If clipboard is blocked, a modal shows the JSON to copy.

## Customize Schema
- Right-click the extension icon → **Options**. Edit the JSON template. The converter merges your template with the auto-extracted fields (title, steps, bullets, constraints…).

## Notes
- Permissions: minimal set for context menu, clipboard, and scripting.
- Host permissions: `<all_urls>` to work on any page.
- No network calls. Everything runs locally.

## Example
Input prompt:
```
Create a step-by-step study guide for BJT biasing. Use English, include formulas, key pitfalls, and 5 practice questions with answers.
```
Output (trimmed):
```json
{
  "title": "Create a step-by-step study guide for BJT biasing. Use English, include formulas, key pitfalls, and 5 practice questions with answers.",
  "task": "Convert natural-language prompt into a structured instruction set for a GPT-style assistant.",
  "intent": "Generate a clear, reproducible, and machine-parseable specification of the user's ask.",
  "audience": "general",
  "language": "English",
  "inputs": { "raw_prompt": "..." },
  "components": {
    "steps": [],
    "bullet_points": [],
    "constraints": ["include formulas", "5 practice questions"],
    "key_terms": ["Create","step","study","guide","BJT","biasing", "..."]
  },
  "output": {
    "expected_formats": ["json"],
    "include_code": false,
    "quality": ["clear","concise","complete"]
  },
  "metadata": { "created_at": "2025-11-04T00:00:00.000Z" }
}
```

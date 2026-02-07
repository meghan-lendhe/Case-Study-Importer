# JSON to Text (Figma Plugin)

Import structured content (exported from Obsidian) and generate **one Figma text layer per line** (including headings, body lines, and list items), so you can quickly lay out a case study page.

Companion repo (Markdown to JSON): https://github.com/meghan-lendhe/md-to-json

---

## What it does

- Accepts JSON copied from the Markdown to JSON Obsidian plugin.
- Creates text layers on the current page in reading order (stacked vertically).
- Styles layers by block type (H1–H6, body, list) and prefixes list items with `• `.

---

## Expected JSON format

An array of blocks like:

```json
[
  { "type": "h1", "level": 1, "text": "Title", "id": "h1-0" },
  { "type": "body", "text": "One line of body text", "id": "body-1" },
  { "type": "list", "text": "One bullet item", "id": "list-2" }
]

```

Supported `type` values: `h1`–`h6`, `body`, `list`.

---

## Usage

1. In Obsidian, run the plugin command to copy JSON to clipboard.
2. In Figma Desktop: Plugins → Development → JSON to Text.
3. Paste JSON into the plugin UI and click Import.
4. The plugin generates text layers and selects them for quick positioning.

---

## Development

### Files
- `code.ts` → source
- `code.js` → compiled output used by Figma (`manifest.json` points to this)
- `ui.html` → plugin UI
- `manifest.json` → Figma plugin manifest (id: `1599736351814752387`)

### Install & build
```bash
npm install
npm run build
```

### Run locally in Figma
In Figma Desktop: Plugins → Development → Import plugin from manifest… and select `manifest.json`.  
(After code changes, rebuild and re-run the plugin.)

---

## Notes

- If a font weight isn’t available, adjust the font style strings in `code.ts` (example: `"Semi Bold"` vs `"SemiBold"`).
- This plugin is designed for fast layout, not perfect Markdown fidelity.

---
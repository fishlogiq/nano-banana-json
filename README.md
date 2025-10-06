# Nano Banana JSON Prompt Generator

Static web UI to compose JSON prompts for Google's "Nano Banana" pipeline.

## Quick Start
- Edit `index.html` to change the form/controls.
- Edit `prompt-generator.js` → `buildPrompt()` to output the exact JSON schema your endpoint expects.
- Hosted via **GitHub Pages** from `main` branch root.

## Dev Notes
- No inline `<script>` tags (CSP-friendly). All JS in `prompt-generator.js`.
- Clipboard uses the modern API with a fallback for non-secure contexts.
- If Pages doesn’t publish: enable **Actions**, add an empty `.nojekyll` at repo root, and push a new commit.

## Customize the JSON
Update `buildPrompt()`:

```js
function buildPrompt() {
  return {
    model: "nano-banana-v1",
    inputs: {
      title: document.querySelector("#title").value.trim(),
      description: document.querySelector("#desc").value.trim(),
      image_url: document.querySelector("#imageUrl").value.trim() || null
    },
    options: { format: "json" }
  };
}


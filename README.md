# bridge-gap
Repository for IDS hackathon project

- node
- storybook
- vite
- web components


### Getting started

Clone repo

`npm install`

`npm run storybook`

Playwright browser binaries are necessary for @storybook/addon-vitest. The
download can take some time. If you don't want to wait, you can skip the
installation and run the following command manually later:
`npx playwright install chromium --with-deps`

│  To run Storybook manually, run `npm run `. CTRL+C to stop.
│
│  Wanna know more about Storybook? Check out https://storybook.js.org/
│  Having trouble or want to chat? Join us at https://discord.gg/storybook/

---

## Figma Plugins

The `figma-plugins/` directory contains Figma plugins for the project.

### Skeleton Plugin

A simple starter plugin that demonstrates the basic Figma plugin structure.

**Structure:**
- `manifest.json` - Plugin configuration
- `code.ts` - Main plugin logic (TypeScript, runs in Figma sandbox)
- `ui.html` - UI panel (HTML/CSS/JS)

**Build:**
```bash
cd figma-plugins/skeleton-plugin
npm install
npm run build    # compile TypeScript once
npm run watch    # compile on file changes
```

**To use in Figma:**
1. Build the plugin first (`npm run build`)
2. Open the Figma desktop app
3. Go to **Plugins → Development → Import plugin from manifest...**
4. Select `figma-plugins/skeleton-plugin/manifest.json`

The plugin creates a simple UI with a button that inserts a colored rectangle at the viewport center.

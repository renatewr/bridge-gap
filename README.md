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

---

## Brand Tokens & Theme Switcher

This project includes a complete brand theming system with 211 brands.

### Generate Brand Tokens

Generate design tokens from primary colors:

```bash
npm run generate-tokens    # Generate JSON tokens in /brands
npm run generate-css       # Generate CSS files in /css
npm run generate-brand-list # Update Storybook brand list
```

### Theme Switcher in Storybook

Storybook includes a toolbar theme switcher (paintbrush icon) that lets you switch between all 211 brand themes in real-time.

Each brand theme provides CSS custom properties:
- `--primary-100` through `--primary-900` - Color scale
- `--primary-surface` - Brand color for surfaces
- `--primary-onSurface` - Text color on brand surfaces
- `--primary-gradient` - Background gradient
- `--white`, `--black` - Base colors

Use these variables in your components to support theme switching:

```css
.button {
  background: var(--primary-500);
  color: var(--primary-onSurface);
}
```

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

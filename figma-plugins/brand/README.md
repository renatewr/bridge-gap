# Brand Palette Documentation Plugin

A Figma plugin that imports brand design tokens from `dist/brands.json` and generates visual documentation similar to the BrandPalette Storybook component.

## Files

| File | Description |
|------|-------------|
| `manifest.json` | Plugin configuration for Figma |
| `package.json` | Dependencies and build scripts |
| `tsconfig.json` | TypeScript configuration |
| `code.ts` | Figma API logic for generating visual documentation |
| `ui.template.html` | UI template with brand selector |
| `build.js` | Build script that embeds brands.json into the UI |

## Features

- Searchable list of all 211 brands with color previews
- Generates a brand card with:
  - Primary color scale (100-900)
  - Semantic tokens (surface/onSurface)
  - Accessible color pairs (100/800, 200/900)
  - Gradient preview (when available)

## Installation

### Install dependencies

```bash
cd figma-plugins/brand
npm install
```

### Build the plugin

```bash
npm run build
```

## Usage in Figma

1. Open Figma Desktop
2. Go to **Plugins → Development → Import plugin from manifest**
3. Select `figma-plugins/brand/manifest.json`
4. Run the plugin from the Plugins menu

## Development

### Rebuild after changes

```bash
cd figma-plugins/brand
npm run build
```

### Available scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build both UI and TypeScript code |
| `npm run build:ui` | Build UI only (embeds brands.json) |
| `npm run build:code` | Compile TypeScript only |
| `npm run watch` | Watch mode for TypeScript changes |

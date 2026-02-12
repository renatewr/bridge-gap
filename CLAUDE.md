# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a design system project (IDS Hackathon) featuring a brand theming system with 211 brands, built with Storybook, Vite, Web Components (Lit), and TypeScript. The core innovation is automated generation of accessible design tokens from primary brand colors.

## Development Commands

### Setup
```bash
npm install
npx playwright install chromium --with-deps  # For Storybook vitest addon
```

### Development
```bash
npm run storybook     # Start Storybook on port 6006
npm run dev           # Start Vite dev server
npm run preview       # Preview production build
```

### Build & Deploy
```bash
npm run build              # TypeScript compilation + Vite build
npm run build-storybook    # Build Storybook static site
npm run chromatic          # Run Chromatic visual regression (CI)
```

### Code Quality
```bash
npm run lint          # Run Biome linter with auto-fix
npm run test          # Run Vitest (currently placeholder)
```

### Brand Token Generation Workflow

**CRITICAL**: These scripts must be run in this exact order when updating brand tokens:

```bash
npm run generate-tokens        # Step 1: JSON tokens from primary-colors.json
npm run generate-css           # Step 2: CSS custom properties from tokens
npm run generate-brand-list    # Step 3: Update Storybook brand switcher
npm run generate-brands-json   # Step 4: Combined dist/brands.json
```

## Architecture

### Brand Token System

The project implements a fully automated, accessibility-first design token pipeline:

**Source of Truth**: [primary-colors/primary-colors.json](primary-colors/primary-colors.json)
- Maps domain names to `{primary, accentOne}` hex colors
- Contains 211+ brand definitions

**Token Generation Pipeline** ([scripts/](scripts/)):
1. **generate-brand-tokens.ts**:
   - Reads primary colors, generates 9-step color scales (100-900)
   - Uses chroma-js for perceptually uniform scales
   - Applies WCAG AA/AAA contrast corrections via [contrast-adjuster.ts](scripts/lib/contrast-adjuster.ts)
   - Outputs DTCG-compliant JSON to [brands/*.json](brands/)
   - Creates `_contrast-report.json` for accessibility audit

2. **generate-brand-css.ts**:
   - Converts DTCG tokens to CSS custom properties
   - Resolves token references (e.g., `{primary-500}` → actual color)
   - Outputs [css/*.css](css/) files for runtime theme switching

3. **generate-brand-list.ts**:
   - Generates [.storybook/brands.ts](.storybook/brands.ts) with brand array
   - Powers Storybook theme switcher toolbar

4. **generate-brands-json.ts**:
   - Creates combined [dist/brands.json](dist/brands.json) for distribution
   - Contains all brands with resolved token values

**Token Structure** (DTCG-compliant):
- `primary-100` to `primary-900`: Color scale with AAA contrast pairs (100↔800, 200↔900)
- `primary-surface`: Semantic token for brand surfaces (references `primary-500`)
- `primary-on-surface`: Automatic text color (white/black) based on contrast
- `primary-gradient`: Gradient using `primary-100` with alpha fade
- `white`, `black`: Base colors

**Key Algorithms**:
- [color-scale.ts](scripts/lib/color-scale.ts): Generates perceptually uniform scales using chroma-js bezier interpolation
- [contrast-adjuster.ts](scripts/lib/contrast-adjuster.ts): Ensures WCAG compliance by adjusting lightness while preserving hue/saturation

### Storybook Configuration

**Theme Switching** ([.storybook/preview.ts](.storybook/preview.ts)):
- Global toolbar with 211 brand options (paintbrush icon)
- Decorator dynamically loads `/css/{brand}.css` on theme change
- CSS custom properties are swapped without page reload

**Static Assets**:
- CSS files served from [css/](css/) via `staticDirs` configuration
- All 211 brand CSS files bundled with Storybook build

**Addons**:
- `@storybook/addon-vitest`: In-browser component tests
- `@storybook/addon-a11y`: Accessibility checks (currently `test: "todo"`)
- `@chromatic-com/storybook`: Visual regression testing (snapshots disabled by default)

### Web Components (Lit)

Component architecture in [src/stories/](src/stories/):
- Web Components built with Lit (HTML templates, reactive properties)
- TypeScript interfaces for props
- Scoped CSS with theme variables: `var(--primary-500)`, `var(--primary-on-surface)`
- Example: [Button.ts](src/stories/Button.ts) demonstrates primary/subtle variants with theme support

### Figma Plugins

Located in [figma-plugins/](figma-plugins/):

**skeleton-plugin**: Starter plugin template
- `manifest.json`: Plugin configuration
- `code.ts`: Sandbox logic (TypeScript)
- `ui.html`: UI panel (HTML/CSS/JS)
- Build: `npm run build` or `npm run watch` inside plugin directory
- Import via Figma → Plugins → Development → Import plugin from manifest

## Code Style

**Biome** ([biome.json](biome.json)):
- Tabs for indentation
- Double quotes
- Auto-organize imports
- VCS integration enabled

## Important Workflows

### Adding a New Brand
1. Add entry to [primary-colors/primary-colors.json](primary-colors/primary-colors.json) with primary/accentOne colors
2. Run complete token generation workflow (4 scripts in order)
3. New brand appears in Storybook theme switcher automatically

### Creating Theme-Aware Components
Use CSS custom properties from the token system:
```css
.my-component {
  background: var(--primary-500);
  color: var(--primary-on-surface);
  border: 1px solid var(--primary-400);
}
```

### Understanding Contrast Adjustments
Check [brands/_contrast-report.json](brands/_contrast-report.json) to see which brands required lightness adjustments to meet WCAG requirements. The `adjusted` and `failed` arrays show original vs. final contrast ratios.

## Testing

**Vitest + Playwright** ([vitest.config.ts](vitest.config.ts)):
- Browser-based testing via `@vitest/browser-playwright`
- Storybook integration via `@storybook/addon-vitest`
- Tests defined in story files
- Setup: [.storybook/vitest.setup.ts](.storybook/vitest.setup.ts)

**Chromatic**:
- Visual regression testing configured
- Snapshots disabled by default in [preview.ts](.storybook/preview.ts)
- Run via `npm run chromatic` or GitHub Actions

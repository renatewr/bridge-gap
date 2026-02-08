# Plan: Generate Brand Color Scales from Primary Colors

#### Original request
User wants to read primary-colors.json and create individual JSON files for each brand key in a "brands" folder. For each primary color, generate a scale from 100-900 where primary-500 is the base color. Accessibility checks required: primary-900 must have 5:1 contrast ratio against primary-200 and primary-100.

## Context

The project has 400+ brand primary colors in `primary-colors/primary-colors.json`. Each brand needs a complete color scale (100-900) generated programmatically, with accessibility checks ensuring proper contrast ratios. The output must follow the DTCG token structure shown in `tokens/brands.json`.

**Goal**: Create a Node.js script that reads primary colors and generates individual brand token files with accessible color scales.

---

## Implementation Plan

### 1. Install Dependencies

Add to `package.json`:
- `chroma-js` - for color manipulation and contrast checking
- `tsx` - to run TypeScript scripts directly

```bash
npm install chroma-js
npm install -D tsx @types/chroma-js
```

### 2. Create Script Structure

```
scripts/
├── generate-brand-tokens.ts      # Main entry point
└── lib/
    ├── color-scale.ts            # LCH color scale generation
    ├── contrast-adjuster.ts      # Accessibility adjustments
    ├── token-builder.ts          # DTCG token structure builder
    └── file-utils.ts             # File I/O and name sanitization
```

### 3. Core Algorithm: Color Scale Generation

**File**: `scripts/lib/color-scale.ts`

- Use LCH color space (perceptually uniform) via `chroma-js`
- Generate 9 steps: 100, 200, 300, 400, 500, 600, 700, 800, 900
- primary-500 = original primary color (anchor point)
- 100-400 = progressively lighter (increase L)
- 600-900 = progressively darker (decrease L)
- Reduce chroma at extremes to avoid gamut clipping

### 4. Contrast Enforcement

**File**: `scripts/lib/contrast-adjuster.ts`

**Requirement**: primary-900 must have ≥5:1 contrast against primary-200 AND primary-100

Algorithm:
1. Generate initial scale
2. Check contrast using `chroma.contrast()`
3. If failing, iteratively adjust:
   - Make 100/200 lighter (increase L toward 98)
   - Make 900 darker (decrease L toward 3)
4. Track adjusted brands in a report

### 5. Token Builder

**File**: `scripts/lib/token-builder.ts`

Generate DTCG-compliant tokens matching `tokens/brands.json` structure:

```json
{
  "brand-key": {
    "white": { "$type": "color", "$value": "rgb(...)", "$description": "...", "$usage": [...] },
    "black": { ... },
    "primary-100": { "$type": "color", "$value": "rgb(...)", "$description": "...", "$pairs": "primary-800", "$a11y": "..." },
    "primary-200": { ... },
    "primary-300": { ... },
    "primary-400": { ... },
    "primary-500": { ... },
    "primary-600": { ... },
    "primary-700": { ... },
    "primary-800": { ... },
    "primary-900": { ... },
    "primary-surface": { "$value": "{brand-key.primary-500}", ... },
    "primary-onSurface": { "$value": "{brand-key.white}", ... },
    "primary-gradient": { "$value": "linear-gradient(...)", ... }
  }
}
```

### 6. Main Script

**File**: `scripts/generate-brand-tokens.ts`

1. Read `primary-colors/primary-colors.json`
2. Create `brands/` output directory
3. For each brand:
   - Generate color scale with accessibility adjustments
   - Build token structure
   - Write to `brands/{sanitized-domain}.json`
4. Write `brands/_contrast-report.json` with adjustment details

### 7. File Naming

Convert domain names to valid filenames:
- `www.aasanetidende.no` → `www-aasanetidende-no.json`
- Replace `.` with `-`, lowercase, remove invalid chars

---

## Critical Files

| File | Purpose |
|------|---------|
| `primary-colors/primary-colors.json` | Input: 400+ brand colors |
| `tokens/brands.json` | Reference: DTCG token structure |
| `package.json` | Add dependencies and npm script |
| `scripts/generate-brand-tokens.ts` | New: main entry point |
| `scripts/lib/color-scale.ts` | New: LCH scale generation |
| `scripts/lib/contrast-adjuster.ts` | New: 5:1 contrast enforcement |
| `scripts/lib/token-builder.ts` | New: DTCG token builder |

---

## Verification

1. **Run the generator**:
   ```bash
   npx tsx scripts/generate-brand-tokens.ts
   ```

2. **Check output**:
   - Verify `brands/` folder contains ~400 JSON files
   - Inspect `brands/_contrast-report.json` for any failed adjustments

3. **Validate contrast manually** for a few brands:
   - Use a contrast checker tool to verify 900 vs 100/200 ratios

4. **Spot-check token structure** against `tokens/brands.json` format

---

## Decisions

- **Scale steps**: Generate all 9 steps (100-900)
- **Accent colors**: Primary only (no accent scale)
- **Brand key format**: Sanitized domain (e.g., `www-aasanetidende-no`)

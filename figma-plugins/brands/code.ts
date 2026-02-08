import tokenData from '../../dist/brands.json';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface TokenData {
  $type: string;
  $value: string;
  $description?: string;
  $usage?: string[];
  $pairs?: string;
  $a11y?: string;
}

type BrandTokens = Record<string, TokenData>;
type BrandsData = Record<string, BrandTokens>;

// ============================================================
// COLOR PARSING HELPERS
// ============================================================

/** Parse an rgb() string to Figma RGB values */
function parseRgbString(rgbStr: string): RGB | null {
  const match = rgbStr.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (match) {
    return {
      r: parseInt(match[1], 10) / 255,
      g: parseInt(match[2], 10) / 255,
      b: parseInt(match[3], 10) / 255,
    };
  }
  return null;
}

const DEFAULT_GREY: SolidPaint = {
  type: 'SOLID',
  color: { r: 0, g: 0, b: 0 },
};

/** Parse a hex color string to Figma RGB values */
function parseHexString(hex: string): RGB | null {
  if (hex.startsWith('#') && hex.length === 7) {
    return {
      r: parseInt(hex.substring(1, 3), 16) / 255,
      g: parseInt(hex.substring(3, 5), 16) / 255,
      b: parseInt(hex.substring(5, 7), 16) / 255,
    };
  }
  return null;
}

/** Parse a linear-gradient string to Figma GradientPaint */
function parseGradientString(value: string): GradientPaint | null {
  const gradientMatch = value.match(
    /^linear-gradient\(\s*(\d+)deg\s*,\s*(.+)\)$/i
  );
  if (!gradientMatch) return null;

  const angle = parseInt(gradientMatch[1], 10);
  const stopsStr = gradientMatch[2];

  const colorStops: { color: RGB; position: number; opacity: number }[] = [];

  // Find all rgb() values with their positions
  const rgbRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*(\d+)%/gi;
  let rgbMatch = rgbRegex.exec(stopsStr);
  while (rgbMatch !== null) {
    colorStops.push({
      color: {
        r: parseInt(rgbMatch[1], 10) / 255,
        g: parseInt(rgbMatch[2], 10) / 255,
        b: parseInt(rgbMatch[3], 10) / 255,
      },
      position: parseInt(rgbMatch[4], 10) / 100,
      opacity: 1,
    });
    rgbMatch = rgbRegex.exec(stopsStr);
  }

  // Also check for rgba with opacity
  const rgbaRegex =
    /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)\s*(\d+)%/gi;
  let rgbaMatch = rgbaRegex.exec(stopsStr);
  while (rgbaMatch !== null) {
    colorStops.push({
      color: {
        r: parseInt(rgbaMatch[1], 10) / 255,
        g: parseInt(rgbaMatch[2], 10) / 255,
        b: parseInt(rgbaMatch[3], 10) / 255,
      },
      position: parseInt(rgbaMatch[5], 10) / 100,
      opacity: parseFloat(rgbaMatch[4]),
    });
    rgbaMatch = rgbaRegex.exec(stopsStr);
  }

  if (colorStops.length < 2) return null;

  // Convert angle to Figma gradient transform
  const radians = (angle - 90) * (Math.PI / 180);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    type: 'GRADIENT_LINEAR',
    gradientTransform: [
      [cos, sin, 0.5 - cos * 0.5 - sin * 0.5],
      [-sin, cos, 0.5 + sin * 0.5 - cos * 0.5],
    ],
    gradientStops: colorStops.map((stop) => ({
      position: stop.position,
      color: { ...stop.color, a: stop.opacity },
    })),
  };
}

/** Parse a color value string (hex, rgb, or gradient) to a Figma Paint */
function parseColorToFill(value: string): Paint {
  try {
    const trimmed = value.trim();

    // Try gradient first
    const gradient = parseGradientString(trimmed);
    if (gradient) return gradient;

    // Try rgb()
    const rgb = parseRgbString(trimmed);
    if (rgb) return { type: 'SOLID', color: rgb };

    // Try hex
    const hex = parseHexString(trimmed);
    if (hex) return { type: 'SOLID', color: hex };

    return DEFAULT_GREY;
  } catch {
    return DEFAULT_GREY;
  }
}

// ============================================================
// MAIN PLUGIN
// ============================================================

(async () => {
  // Show loading notification (stays visible until cancelled)
  const loadingNotification = figma.notify('Generating documentation...', {
    timeout: Infinity,
  });

  // Load Fonts
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  // Helper: Create a single Token Card
  function createCard(
    name: string,
    value: string,
    description: string | undefined,
    textColor?: string // Optional text color to overlay on color chips
  ) {
    const card = figma.createFrame();
    card.name = name;
    card.layoutMode = 'VERTICAL';
    card.primaryAxisSizingMode = 'AUTO';
    card.counterAxisSizingMode = 'FIXED';
    card.resize(120, 100);
    card.paddingLeft = 8;
    card.paddingRight = 8;
    card.paddingTop = 8;
    card.paddingBottom = 8;
    card.itemSpacing = 6;
    card.cornerRadius = 6;
    card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    card.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];

    // Color preview chip
    const chipContainer = figma.createFrame();
    chipContainer.name = 'chip-container';
    chipContainer.resize(104, 60);
    chipContainer.layoutAlign = 'STRETCH';
    chipContainer.fills = [];

    const chip = figma.createRectangle();
    chip.name = '__fill';
    chip.resize(104, 60);
    chip.cornerRadius = 4;
    chip.fills = [parseColorToFill(value)];
    chipContainer.appendChild(chip);

    // Add AAA text overlay if textColor is provided (for accessible pairs)
    if (textColor) {
      const rgb = parseRgbString(textColor);
      if (rgb) {
        const aaaText = figma.createText();
        aaaText.characters = 'AAA';
        aaaText.fontName = { family: 'Inter', style: 'Bold' };
        aaaText.fontSize = 14;
        aaaText.fills = [{ type: 'SOLID', color: rgb }];
        aaaText.x = (104 - aaaText.width) / 2;
        aaaText.y = (60 - aaaText.height) / 2;
        chipContainer.appendChild(aaaText);
      }
    }

    card.appendChild(chipContainer);

    // Token name
    const tName = figma.createText();
    tName.characters = name;
    tName.fontName = { family: 'Inter', style: 'Bold' };
    tName.fontSize = 10;
    tName.layoutAlign = 'STRETCH';
    card.appendChild(tName);

    // Description (if available) - allow text to wrap
    if (description) {
      const tDesc = figma.createText();
      tDesc.characters = description;
      tDesc.fontSize = 8;
      tDesc.layoutAlign = 'STRETCH';
      tDesc.textAutoResize = 'HEIGHT';
      tDesc.fills = [DEFAULT_GREY];
      card.appendChild(tDesc);
    }

    return card;
  }

  // Helper to create a labeled row with horizontal cards
  function createRow(label: string) {
    const row = figma.createFrame();
    row.name = label;
    row.layoutMode = 'VERTICAL';
    row.primaryAxisSizingMode = 'AUTO';
    row.counterAxisSizingMode = 'AUTO';
    row.itemSpacing = 8;
    row.paddingTop = 10;
    row.paddingBottom = 10;
    row.fills = [];

    // Add row label
    const rowLabel = figma.createText();
    rowLabel.characters = label;
    rowLabel.fontName = { family: 'Inter', style: 'Bold' };
    rowLabel.fontSize = 14;
    row.appendChild(rowLabel);

    // Create horizontal container for cards
    const rowCards = figma.createFrame();
    rowCards.name = 'Row Cards';
    rowCards.layoutMode = 'HORIZONTAL';
    rowCards.primaryAxisSizingMode = 'AUTO';
    rowCards.counterAxisSizingMode = 'AUTO';
    rowCards.itemSpacing = 8;
    rowCards.fills = [];
    row.appendChild(rowCards);

    return { row, rowCards };
  }

  // Process a brand's flat token structure
  function processBrandTokens(tokens: BrandTokens, container: FrameNode) {
    // Group tokens by category
    const primaryScaleTokens: string[] = [];
    const semanticTokens: string[] = [];
    const baseTokens: string[] = [];

    for (const key of Object.keys(tokens)) {
      if (key.match(/^primary-\d{3}$/)) {
        primaryScaleTokens.push(key);
      } else if (key.startsWith('primary-')) {
        semanticTokens.push(key);
      } else {
        baseTokens.push(key);
      }
    }

    // Sort primary scale tokens numerically
    primaryScaleTokens.sort((a, b) => {
      const numA = parseInt(a.replace('primary-', ''), 10);
      const numB = parseInt(b.replace('primary-', ''), 10);
      return numA - numB;
    });

    // Create Primary Scale row
    if (primaryScaleTokens.length > 0) {
      const { row, rowCards } = createRow('Primary Scale');

      for (const tokenName of primaryScaleTokens) {
        const token = tokens[tokenName];
        // Check for AAA pairs
        let textColor: string | undefined;
        if (tokenName === 'primary-100' && tokens['primary-800']) {
          textColor = tokens['primary-800'].$value;
        } else if (tokenName === 'primary-800' && tokens['primary-100']) {
          textColor = tokens['primary-100'].$value;
        }

        const card = createCard(
          tokenName,
          token.$value,
          token.$description,
          textColor
        );
        rowCards.appendChild(card);
      }

      container.appendChild(row);
    }

    // Create Semantic Tokens row
    if (semanticTokens.length > 0) {
      const { row, rowCards } = createRow('Semantic Tokens');

      for (const tokenName of semanticTokens) {
        const token = tokens[tokenName];
        // For surface, show onSurface text
        let textColor: string | undefined;
        if (tokenName === 'primary-surface' && tokens['primary-onSurface']) {
          textColor = tokens['primary-onSurface'].$value;
        }

        const card = createCard(
          tokenName,
          token.$value,
          token.$description,
          textColor
        );
        rowCards.appendChild(card);
      }

      container.appendChild(row);
    }

    // Create Base Colors row
    if (baseTokens.length > 0) {
      const { row, rowCards } = createRow('Base Colors');

      for (const tokenName of baseTokens) {
        const token = tokens[tokenName];
        const card = createCard(
          tokenName,
          token.$value,
          token.$description
        );
        rowCards.appendChild(card);
      }

      container.appendChild(row);
    }
  }

  // ============================================================
  // MAIN EXECUTION LOOP
  // ============================================================

  const brands = tokenData as BrandsData;
  let xOffset = 0;
  let yOffset = 0;
  let brandCount = 0;
  let rowMaxHeight = 0;
  const BRANDS_PER_ROW = 5;

  for (const [brandName, brandTokens] of Object.entries(brands)) {
    brandCount++;

    // 1. Create a Section for the Brand (easier to navigate in Figma)
    const section = figma.createSection();
    section.name = `${brandCount}. ${brandName}`;

    // 2. Create a Frame inside the Section for the content
    const brandFrame = figma.createFrame();
    brandFrame.name = brandName;
    brandFrame.layoutMode = 'VERTICAL';
    brandFrame.primaryAxisSizingMode = 'AUTO';
    brandFrame.counterAxisSizingMode = 'AUTO';
    brandFrame.paddingLeft = 20;
    brandFrame.paddingRight = 20;
    brandFrame.paddingTop = 20;
    brandFrame.paddingBottom = 20;
    brandFrame.itemSpacing = 10;
    brandFrame.fills = [
      { type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 } },
    ];

    // 3. Add Title
    const title = figma.createText();
    title.characters = brandName;
    title.fontName = { family: 'Inter', style: 'Bold' };
    title.fontSize = 18;
    brandFrame.appendChild(title);

    // 4. Process and add token rows
    processBrandTokens(brandTokens, brandFrame);

    // 5. Add frame to section, resize section, and center the frame
    section.appendChild(brandFrame);
    const sectionPadding = 40;
    section.resizeWithoutConstraints(
      brandFrame.width + sectionPadding,
      brandFrame.height + sectionPadding
    );
    brandFrame.x = sectionPadding / 2;
    brandFrame.y = sectionPadding / 2;

    // 6. Position the section in grid
    section.x = xOffset;
    section.y = yOffset;

    // Track tallest section in current row
    rowMaxHeight = Math.max(rowMaxHeight, section.height);

    // 7. Move to next position
    if (brandCount % BRANDS_PER_ROW === 0) {
      xOffset = 0;
      yOffset += rowMaxHeight + 100;
      rowMaxHeight = 0;
    } else {
      xOffset += section.width + 80;
    }

    // Progress notification every 20 brands
    if (brandCount % 20 === 0) {
      figma.notify(`Processing brand ${brandCount}...`, { timeout: 500 });
    }
  }

  loadingNotification.cancel();
  figma.notify(`Generated documentation for ${brandCount} brands!`);
  figma.closePlugin();
})();

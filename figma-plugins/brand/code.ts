// Brand Palette Documentation Plugin
// Generates visual documentation for brand color palettes in Figma

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

interface GenerateMessage {
	type: "generate";
	brandName: string;
	tokens: BrandTokens;
}

interface GenerateAllMessage {
	type: "generate-all";
	brands: BrandsData;
}

interface CancelMessage {
	type: "cancel";
}

type PluginMessage = GenerateMessage | GenerateAllMessage | CancelMessage;

// Parse rgb string to Figma RGB (0-1 range)
function parseRgbColor(rgbString: string): RGB | null {
	const match = rgbString.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
	if (!match) return null;
	return {
		r: parseInt(match[1]) / 255,
		g: parseInt(match[2]) / 255,
		b: parseInt(match[3]) / 255,
	};
}

// Create a color swatch rectangle
function createColorSwatch(
	color: RGB,
	x: number,
	y: number,
	width: number,
	height: number
): RectangleNode {
	const rect = figma.createRectangle();
	rect.x = x;
	rect.y = y;
	rect.resize(width, height);
	rect.fills = [{ type: "SOLID", color }];
	rect.cornerRadius = 4;
	return rect;
}

// Create a text label
async function createTextLabel(
	text: string,
	x: number,
	y: number,
	fontSize: number = 12,
	color: RGB = { r: 0.2, g: 0.2, b: 0.2 },
	fontWeight: "Regular" | "Bold" = "Regular"
): Promise<TextNode> {
	const textNode = figma.createText();
	await figma.loadFontAsync({ family: "Inter", style: fontWeight });
	textNode.fontName = { family: "Inter", style: fontWeight };
	textNode.characters = text;
	textNode.fontSize = fontSize;
	textNode.fills = [{ type: "SOLID", color }];
	textNode.x = x;
	textNode.y = y;
	return textNode;
}

// Create a brand card with color scale and semantic tokens
async function createBrandCard(
	brandName: string,
	tokens: BrandTokens,
	startX: number,
	startY: number
): Promise<FrameNode> {
	const cardWidth = 320;
	const swatchHeight = 32;
	const padding = 16;

	const frame = figma.createFrame();
	frame.name = brandName;
	frame.x = startX;
	frame.y = startY;
	frame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
	frame.cornerRadius = 8;
	frame.strokeWeight = 1;
	frame.strokes = [{ type: "SOLID", color: { r: 0.88, g: 0.88, b: 0.88 } }];

	const elements: SceneNode[] = [];
	let currentY = padding;

	// Header
	const header = await createTextLabel(
		brandName,
		padding,
		currentY,
		14,
		{ r: 0.1, g: 0.1, b: 0.1 },
		"Bold"
	);
	elements.push(header);
	currentY += 30;

	// Primary scale heading
	const scaleHeading = await createTextLabel(
		"primary-100 to primary-900",
		padding,
		currentY,
		12,
		{ r: 0.3, g: 0.3, b: 0.3 },
		"Bold"
	);
	elements.push(scaleHeading);
	currentY += 24;

	// Primary scale colors
	const primaryScale = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
	const swatchWidth = (cardWidth - padding * 2) / primaryScale.length;

	for (let i = 0; i < primaryScale.length; i++) {
		const step = primaryScale[i];
		const token = tokens[`primary-${step}`];
		if (token) {
			const color = parseRgbColor(token.$value);
			if (color) {
				const swatch = createColorSwatch(
					color,
					padding + i * swatchWidth,
					currentY,
					swatchWidth - 2,
					swatchHeight
				);
				swatch.name = `primary-${step}`;
				elements.push(swatch);
			}
		}
	}
	currentY += swatchHeight + 8;

	// Scale labels
	for (let i = 0; i < primaryScale.length; i++) {
		const step = primaryScale[i];
		const label = await createTextLabel(
			step,
			padding + i * swatchWidth + swatchWidth / 2 - 8,
			currentY,
			10,
			{ r: 0, g: 0, b: 0 }
		);
		elements.push(label);
	}
	currentY += 24;

	// Semantic tokens section
	const semanticLabel = await createTextLabel(
		"Semantic Tokens",
		padding,
		currentY,
		12,
		{ r: 0.3, g: 0.3, b: 0.3 },
		"Bold"
	);
	elements.push(semanticLabel);
	currentY += 24;

	// Surface and onSurface cards side by side
	const surfaceToken = tokens["primary-surface"];
	const onSurfaceToken = tokens["primary-onSurface"];
	const semanticCardWidth = (cardWidth - padding * 2 - 8) / 2;
	const semanticSwatchHeight = 40;

	if (surfaceToken) {
		const surfaceColor = parseRgbColor(surfaceToken.$value);
		if (surfaceColor) {
			// Surface swatch
			const surfaceRect = createColorSwatch(
				surfaceColor,
				padding,
				currentY,
				semanticCardWidth,
				semanticSwatchHeight
			);
			surfaceRect.name = "primary-surface";
			elements.push(surfaceRect);

			// Add "AA" text overlay using onSurface color
			if (onSurfaceToken) {
				const onSurfaceColor = parseRgbColor(onSurfaceToken.$value);
				if (onSurfaceColor) {
					const aaLabel = await createTextLabel(
						"AA",
						padding + semanticCardWidth / 2 - 14,
						currentY + semanticSwatchHeight / 2 - 10,
						20,
						onSurfaceColor
					);
					elements.push(aaLabel);
				}
			}

			// Surface name
			const surfaceName = await createTextLabel(
				"primary-surface",
				padding,
				currentY + semanticSwatchHeight + 4,
				10,
				{ r: 0.2, g: 0.2, b: 0.2 },
				"Bold"
			);
			elements.push(surfaceName);

			// Surface description
			if (surfaceToken.$description) {
				const surfaceDesc = await createTextLabel(
					surfaceToken.$description,
					padding,
					currentY + semanticSwatchHeight + 18,
					8,
					{ r: 0, g: 0, b: 0 }
				);
				elements.push(surfaceDesc);
			}
		}
	}

	if (onSurfaceToken) {
		const onSurfaceColor = parseRgbColor(onSurfaceToken.$value);
		if (onSurfaceColor) {
			// onSurface swatch
			const onSurfaceRect = createColorSwatch(
				onSurfaceColor,
				padding + semanticCardWidth + 8,
				currentY,
				semanticCardWidth,
				semanticSwatchHeight
			);
			onSurfaceRect.name = "primary-onSurface";
			elements.push(onSurfaceRect);

			// onSurface name
			const onSurfaceName = await createTextLabel(
				"primary-onSurface",
				padding + semanticCardWidth + 8,
				currentY + semanticSwatchHeight + 4,
				10,
				{ r: 0.2, g: 0.2, b: 0.2 },
				"Bold"
			);
			elements.push(onSurfaceName);

			// onSurface description
			if (onSurfaceToken.$description) {
				const onSurfaceDesc = await createTextLabel(
					onSurfaceToken.$description,
					padding + semanticCardWidth + 8,
					currentY + semanticSwatchHeight + 18,
					8,
					{ r: 0, g: 0, b: 0 }
				);
				elements.push(onSurfaceDesc);
			}
		}
	}
	currentY += semanticSwatchHeight + 40;

	// Accessible pairs demo
	const pairsLabel = await createTextLabel(
		"Accessible Pairs (AAA)",
		padding,
		currentY,
		12,
		{ r: 0.3, g: 0.3, b: 0.3 },
		"Bold"
	);
	elements.push(pairsLabel);
	currentY += 24;

	// 100/800 pair
	const token100 = tokens["primary-100"];
	const token800 = tokens["primary-800"];
	const token200 = tokens["primary-200"];
	const token900 = tokens["primary-900"];
	const color100 = token100 ? parseRgbColor(token100.$value) : null;
	const color800 = token800 ? parseRgbColor(token800.$value) : null;
	const color200 = token200 ? parseRgbColor(token200.$value) : null;
	const color900 = token900 ? parseRgbColor(token900.$value) : null;

	const pairWidth = (cardWidth - padding * 2 - 8) / 2;
	const pairSwatchHeight = 40;

	if (color100 && color800) {
		// 100/800 swatch with AAA text
		const pair1Bg = createColorSwatch(color100, padding, currentY, pairWidth, pairSwatchHeight);
		pair1Bg.name = "pair-100-800-bg";
		elements.push(pair1Bg);

		const pair1AaaLabel = await createTextLabel(
			"AAA",
			padding + pairWidth / 2 - 20,
			currentY + pairSwatchHeight / 2 - 10,
			20,
			color800
		);
		elements.push(pair1AaaLabel);

		// 100/800 name
		const pair1Name = await createTextLabel(
			"primary-100 / primary-800",
			padding,
			currentY + pairSwatchHeight + 4,
			10,
			{ r: 0.2, g: 0.2, b: 0.2 },
			"Bold"
		);
		elements.push(pair1Name);

		// 100/800 description
		const pair1Desc = await createTextLabel(
			"AAA contrast pairing",
			padding,
			currentY + pairSwatchHeight + 18,
			8,
			{ r: 0, g: 0, b: 0 }
		);
		elements.push(pair1Desc);
	}

	if (color200 && color900) {
		// 200/900 swatch with AAA text
		const pair2Bg = createColorSwatch(color200, padding + pairWidth + 8, currentY, pairWidth, pairSwatchHeight);
		pair2Bg.name = "pair-200-900-bg";
		elements.push(pair2Bg);

		const pair2AaaLabel = await createTextLabel(
			"AAA",
			padding + pairWidth + 8 + pairWidth / 2 - 20,
			currentY + pairSwatchHeight / 2 - 10,
			20,
			color900
		);
		elements.push(pair2AaaLabel);

		// 200/900 name
		const pair2Name = await createTextLabel(
			"primary-200 / primary-900",
			padding + pairWidth + 8,
			currentY + pairSwatchHeight + 4,
			10,
			{ r: 0.2, g: 0.2, b: 0.2 },
			"Bold"
		);
		elements.push(pair2Name);

		// 200/900 description
		const pair2Desc = await createTextLabel(
			"AAA contrast pairing",
			padding + pairWidth + 8,
			currentY + pairSwatchHeight + 18,
			8,
			{ r: 0, g: 0, b: 0 }
		);
		elements.push(pair2Desc);
	}
	currentY += pairSwatchHeight + 40;

	// Gradient if available
	const gradientToken = tokens["primary-gradient"];
	if (gradientToken) {
		const gradientLabel = await createTextLabel(
			"Gradient",
			padding,
			currentY,
			12,
			{ r: 0.3, g: 0.3, b: 0.3 },
			"Bold"
		);
		elements.push(gradientLabel);
		currentY += 24;

		// Create a simple gradient representation using the 100 color
		if (color100) {
			const gradientRect = figma.createRectangle();
			gradientRect.x = padding;
			gradientRect.y = currentY;
			gradientRect.resize(cardWidth - padding * 2, 40);
			gradientRect.cornerRadius = 4;
			gradientRect.name = "primary-gradient";

			// Create gradient fill
			gradientRect.fills = [
				{
					type: "GRADIENT_LINEAR",
					gradientTransform: [
						[0, 1, 0],
						[-1, 0, 1],
					],
					gradientStops: [
						{ position: 0, color: { ...color100, a: 1 } },
						{ position: 0.3, color: { ...color100, a: 0 } },
					],
				},
			];
			elements.push(gradientRect);
			currentY += 48;
		}
	}

	// Add all elements to frame
	for (const el of elements) {
		frame.appendChild(el);
	}

	frame.resize(cardWidth, currentY + padding);

	return frame;
}

// Show the UI
figma.showUI(__html__, { width: 400, height: 500 });

// Handle messages from the UI
figma.ui.onmessage = async (msg: PluginMessage) => {
	if (msg.type === "generate") {
		try {
			const card = await createBrandCard(
				msg.brandName,
				msg.tokens,
				figma.viewport.center.x - 160,
				figma.viewport.center.y - 200
			);

			figma.currentPage.appendChild(card);
			figma.currentPage.selection = [card];
			figma.viewport.scrollAndZoomIntoView([card]);

			figma.notify(`Brand palette created for ${msg.brandName}!`);
		} catch (error) {
			figma.notify(`Error: ${error}`, { error: true });
		}
	}

	if (msg.type === "generate-all") {
		try {
			const brandNames = Object.keys(msg.brands).sort();
			const cardWidth = 340;
			const cardHeight = 400;
			const gap = 24;
			const columns = 4;

			const startX = figma.viewport.center.x - ((columns * cardWidth + (columns - 1) * gap) / 2);
			const startY = figma.viewport.center.y - 200;

			const allCards: FrameNode[] = [];

			for (let i = 0; i < brandNames.length; i++) {
				const brandName = brandNames[i];
				const tokens = msg.brands[brandName];

				const col = i % columns;
				const row = Math.floor(i / columns);

				const x = startX + col * (cardWidth + gap);
				const y = startY + row * (cardHeight + gap);

				const card = await createBrandCard(brandName, tokens, x, y);
				figma.currentPage.appendChild(card);
				allCards.push(card);

				// Update progress
				if ((i + 1) % 10 === 0 || i === brandNames.length - 1) {
					figma.notify(`Creating palettes: ${i + 1} of ${brandNames.length}...`);
				}
			}

			figma.currentPage.selection = allCards;
			figma.viewport.scrollAndZoomIntoView(allCards);

			figma.notify(`Created ${brandNames.length} brand palettes!`);
		} catch (error) {
			figma.notify(`Error: ${error}`, { error: true });
		}
	}

	if (msg.type === "cancel") {
		figma.closePlugin();
	}
};

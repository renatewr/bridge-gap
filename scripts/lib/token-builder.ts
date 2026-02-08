import chroma from "chroma-js";
import { generateColorScale, type ScaleStep } from "./color-scale.ts";
import {
	ensureContrastRequirement,
	type ContrastResult,
} from "./contrast-adjuster.ts";

interface DTCGToken {
	$type: string;
	$value: string;
	$description: string;
	$usage?: string[];
	$a11y?: string;
	$pairs?: string;
}

interface BrandColors {
	primary: string;
	accentOne: string;
}

interface BuildResult {
	tokens: Record<string, DTCGToken>;
	adjustments: Omit<ContrastResult, "scale">;
}

/**
 * Converts rgb() to rgba() with given alpha.
 */
function toRgba(rgbString: string, alpha: number): string {
	return rgbString.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
}

/**
 * Builds a scale token with proper DTCG structure.
 */
function buildScaleToken(
	step: ScaleStep,
	type: "primary" | "accent",
): DTCGToken {
	const descriptions: Record<number, string> = {
		100: `Lightest ${type} shade, AAA compatible with ${type}-800`,
		200: `Very light ${type} shade, AAA compatible with ${type}-900`,
		300: `Light ${type} shade`,
		400: "Borders and separators",
		500: type === "primary" ? "Primary brand color" : "Accent brand color",
		600: `Medium dark ${type} shade`,
		700: `Dark ${type} shade`,
		800: `Very dark ${type} shade, AAA compatible with ${type}-100`,
		900: `Darkest ${type} shade, AAA compatible with ${type}-200`,
	};

	const token: DTCGToken = {
		$type: "color",
		$value: step.color,
		$description: descriptions[step.step] || `${type}-${step.step}`,
	};

	// Add accessibility info for key pairs
	if (step.step === 100) {
		token.$pairs = `${type}-800`;
		token.$a11y = `Meets WCAG AAA contrast on ${type}-800`;
	} else if (step.step === 200) {
		token.$pairs = `${type}-900`;
		token.$a11y = `Meets WCAG AAA contrast on ${type}-900`;
	} else if (step.step === 800) {
		token.$pairs = `${type}-100`;
		token.$a11y = `Meets WCAG AA contrast on ${type}-100`;
	} else if (step.step === 900) {
		token.$pairs = `${type}-200`;
		token.$a11y = `Meets WCAG AAA contrast on ${type}-200`;
	} else if (step.step === 400) {
		token.$a11y = "Non-text contrast only";
	}

	return token;
}

/**
 * Generates DTCG-compliant brand tokens from primary color.
 */
export function generateBrandTokens(
	_domain: string,
	colors: BrandColors,
): BuildResult {

	// Generate primary scale
	const primaryRawScale = generateColorScale(colors.primary);
	const { scale: primaryScale, ...primaryAdjustments } =
		ensureContrastRequirement(primaryRawScale);

	// Build token structure
	const tokens: Record<string, DTCGToken> = {};

	// Base colors
	tokens.white = {
		$type: "color",
		$value: "rgb(255, 255, 255)",
		$description: "Pure white",
		$usage: ["background", "surface", "text"],
	};

	tokens.black = {
		$type: "color",
		$value: "rgb(0, 0, 0)",
		$description: "Pure black",
		$usage: ["text", "overlay"],
	};

	// Primary scale tokens
	for (const step of primaryScale) {
		const key = `primary-${step.step}`;
		tokens[key] = buildScaleToken(step, "primary");
	}

	// Semantic tokens - use simple references without brand prefix for Style Dictionary compatibility
	tokens["primary-surface"] = {
		$type: "color",
		$value: "{primary-500}",
		$description: "Brand color applied to surfaces",
		$usage: ["background"],
	};

	// Calculate onSurface based on contrast
	const primary500 = primaryScale.find((s) => s.step === 500)!;
	const contrastWithWhite = chroma.contrast(primary500.color, "white");
	const onSurfaceValue = contrastWithWhite >= 4.5 ? "white" : "black";

	tokens["primary-onSurface"] = {
		$type: "color",
		$value: `{${onSurfaceValue}}`,
		$description: "Text or icons on top of primary-surface",
		$usage: ["text", "icons"],
		$a11y: "Meets WCAG AA contrast on primary-surface",
	};

	// Gradient using primary-100
	const primary100 = primaryScale.find((s) => s.step === 100)!;
	tokens["primary-gradient"] = {
		$type: "color",
		$value: `linear-gradient(180deg, ${primary100.color} 0%, ${toRgba(primary100.color, 0)} 30%)`,
		$description: "Background gradient",
	};

	return {
		tokens,
		adjustments: primaryAdjustments,
	};
}

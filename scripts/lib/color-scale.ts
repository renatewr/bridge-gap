import chroma from "chroma-js";

export interface ScaleStep {
	step: number;
	color: string;
	lch: [number, number, number];
}

/**
 * Interpolates between base lightness and target lightness.
 */
function interpolateLightness(base: number, target: number, t: number): number {
	return base + (target - base) * t;
}

/**
 * Formats a chroma color as rgb() string.
 */
function formatAsRgb(color: chroma.Color): string {
	const [r, g, b] = color.rgb();
	return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/**
 * Generates a 9-step color scale (100-900) from a base color
 * using LCH color space for perceptual uniformity.
 *
 * The base color anchors at step 500.
 */
export function generateColorScale(
	baseColor: string,
	options?: { minLightness?: number; maxLightness?: number },
): ScaleStep[] {
	const base = chroma(baseColor);
	const [baseL, baseC, baseH] = base.lch();

	const minL = options?.minLightness ?? 5; // Near black
	const maxL = options?.maxLightness ?? 98; // Near white

	// Define lightness targets for each step
	// 500 = base, lighter steps go toward maxL, darker toward minL
	const lightnessMap: Record<number, number> = {
		100: interpolateLightness(baseL, maxL, 0.9), // Very light
		200: interpolateLightness(baseL, maxL, 0.7), // Light
		300: interpolateLightness(baseL, maxL, 0.5), // Medium light
		400: interpolateLightness(baseL, maxL, 0.25), // Slightly light
		500: baseL, // Base color
		600: interpolateLightness(baseL, minL, 0.25), // Slightly dark
		700: interpolateLightness(baseL, minL, 0.5), // Medium dark
		800: interpolateLightness(baseL, minL, 0.7), // Dark
		900: interpolateLightness(baseL, minL, 0.9), // Very dark
	};

	const scale: ScaleStep[] = [];

	for (const step of [100, 200, 300, 400, 500, 600, 700, 800, 900]) {
		const targetL = lightnessMap[step];
		// Keep chroma and hue, adjust lightness
		// Reduce chroma slightly at extremes to avoid gamut issues
		const chromaFactor =
			step === 100 || step === 900
				? 0.6
				: step === 200 || step === 800
					? 0.8
					: 1;

		const adjustedChroma = baseC * chromaFactor;
		const color = chroma.lch(targetL, adjustedChroma, baseH);

		scale.push({
			step,
			color: formatAsRgb(color),
			lch: [targetL, adjustedChroma, baseH],
		});
	}

	return scale;
}

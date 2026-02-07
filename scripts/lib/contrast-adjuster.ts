import chroma from "chroma-js";
import type { ScaleStep } from "./color-scale.ts";

export interface ContrastResult {
	scale: ScaleStep[];
	wasAdjusted: boolean;
	meetsContrast: boolean;
	originalContrast: { against100: number; against200: number };
	finalContrast: { against100: number; against200: number };
}

const REQUIRED_CONTRAST = 5; // 5:1 contrast ratio requirement

/**
 * Formats a chroma color as rgb() string.
 */
function formatAsRgb(color: chroma.Color): string {
	const [r, g, b] = color.rgb();
	return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/**
 * Ensures primary-900 has at least 5:1 contrast against primary-100 AND primary-200.
 * Adjusts lightness values iteratively if needed.
 */
export function ensureContrastRequirement(scale: ScaleStep[]): ContrastResult {
	const step100 = scale.find((s) => s.step === 100)!;
	const step200 = scale.find((s) => s.step === 200)!;
	const step900 = scale.find((s) => s.step === 900)!;

	const originalContrast = {
		against100: chroma.contrast(step100.color, step900.color),
		against200: chroma.contrast(step200.color, step900.color),
	};

	let meetsContrast =
		originalContrast.against100 >= REQUIRED_CONTRAST &&
		originalContrast.against200 >= REQUIRED_CONTRAST;

	if (meetsContrast) {
		return {
			scale,
			wasAdjusted: false,
			meetsContrast: true,
			originalContrast,
			finalContrast: originalContrast,
		};
	}

	// Deep copy the scale for adjustment
	const adjustedScale = scale.map((s) => ({
		...s,
		lch: [...s.lch] as [number, number, number],
	}));

	let wasAdjusted = false;
	const maxIterations = 20;
	let iteration = 0;

	while (!meetsContrast && iteration < maxIterations) {
		iteration++;
		wasAdjusted = true;

		const adj100 = adjustedScale.find((s) => s.step === 100)!;
		const adj200 = adjustedScale.find((s) => s.step === 200)!;
		const adj900 = adjustedScale.find((s) => s.step === 900)!;

		// Make 100 and 200 lighter (if room)
		if (adj100.lch[0] < 97) {
			adj100.lch[0] = Math.min(98, adj100.lch[0] + 2);
			adj100.color = formatAsRgb(chroma.lch(...adj100.lch));
		}
		if (adj200.lch[0] < 95) {
			adj200.lch[0] = Math.min(96, adj200.lch[0] + 2);
			adj200.color = formatAsRgb(chroma.lch(...adj200.lch));
		}

		// Make 900 darker (if room)
		if (adj900.lch[0] > 5) {
			adj900.lch[0] = Math.max(3, adj900.lch[0] - 2);
			adj900.color = formatAsRgb(chroma.lch(...adj900.lch));
		}

		const newContrast100 = chroma.contrast(adj100.color, adj900.color);
		const newContrast200 = chroma.contrast(adj200.color, adj900.color);

		meetsContrast =
			newContrast100 >= REQUIRED_CONTRAST &&
			newContrast200 >= REQUIRED_CONTRAST;
	}

	const adj100 = adjustedScale.find((s) => s.step === 100)!;
	const adj200 = adjustedScale.find((s) => s.step === 200)!;
	const adj900 = adjustedScale.find((s) => s.step === 900)!;

	return {
		scale: adjustedScale,
		wasAdjusted,
		meetsContrast,
		originalContrast,
		finalContrast: {
			against100: chroma.contrast(adj100.color, adj900.color),
			against200: chroma.contrast(adj200.color, adj900.color),
		},
	};
}

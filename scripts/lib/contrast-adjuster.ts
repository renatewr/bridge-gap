import chroma from "chroma-js";
import type { ScaleStep } from "./color-scale.ts";

export interface ContrastResult {
	scale: ScaleStep[];
	wasAdjusted: boolean;
	meetsContrast: boolean;
	originalContrast: { pair100_800: number; pair200_900: number };
	finalContrast: { pair100_800: number; pair200_900: number };
}

const REQUIRED_CONTRAST = 7.5; // 7.5:1 contrast ratio requirement for AAA

/**
 * Formats a chroma color as rgb() string.
 */
function formatAsRgb(color: chroma.Color): string {
	const [r, g, b] = color.rgb();
	return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/**
 * Ensures accessible contrast pairings:
 * - primary-100 / primary-800: 7.5:1 contrast ratio
 * - primary-200 / primary-900: 7.5:1 contrast ratio
 * Adjusts lightness values iteratively if needed.
 */
export function ensureContrastRequirement(scale: ScaleStep[]): ContrastResult {
	const step100 = scale.find((s) => s.step === 100)!;
	const step200 = scale.find((s) => s.step === 200)!;
	const step800 = scale.find((s) => s.step === 800)!;
	const step900 = scale.find((s) => s.step === 900)!;

	const originalContrast = {
		pair100_800: chroma.contrast(step100.color, step800.color),
		pair200_900: chroma.contrast(step200.color, step900.color),
	};

	let meetsContrast =
		originalContrast.pair100_800 >= REQUIRED_CONTRAST &&
		originalContrast.pair200_900 >= REQUIRED_CONTRAST;

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
		const adj800 = adjustedScale.find((s) => s.step === 800)!;
		const adj900 = adjustedScale.find((s) => s.step === 900)!;

		const contrast100_800 = chroma.contrast(adj100.color, adj800.color);
		const contrast200_900 = chroma.contrast(adj200.color, adj900.color);

		// Adjust pair 100/800 if needed
		if (contrast100_800 < REQUIRED_CONTRAST) {
			// Make 100 lighter (if room)
			if (adj100.lch[0] < 97) {
				adj100.lch[0] = Math.min(98, adj100.lch[0] + 2);
				adj100.color = formatAsRgb(chroma.lch(...adj100.lch));
			}
			// Make 800 darker (if room)
			if (adj800.lch[0] > 8) {
				adj800.lch[0] = Math.max(5, adj800.lch[0] - 2);
				adj800.color = formatAsRgb(chroma.lch(...adj800.lch));
			}
		}

		// Adjust pair 200/900 if needed
		if (contrast200_900 < REQUIRED_CONTRAST) {
			// Make 200 lighter (if room)
			if (adj200.lch[0] < 95) {
				adj200.lch[0] = Math.min(96, adj200.lch[0] + 2);
				adj200.color = formatAsRgb(chroma.lch(...adj200.lch));
			}
			// Make 900 darker (if room)
			if (adj900.lch[0] > 5) {
				adj900.lch[0] = Math.max(3, adj900.lch[0] - 2);
				adj900.color = formatAsRgb(chroma.lch(...adj900.lch));
			}
		}

		const newContrast100_800 = chroma.contrast(adj100.color, adj800.color);
		const newContrast200_900 = chroma.contrast(adj200.color, adj900.color);

		meetsContrast =
			newContrast100_800 >= REQUIRED_CONTRAST &&
			newContrast200_900 >= REQUIRED_CONTRAST;
	}

	const adj100 = adjustedScale.find((s) => s.step === 100)!;
	const adj200 = adjustedScale.find((s) => s.step === 200)!;
	const adj800 = adjustedScale.find((s) => s.step === 800)!;
	const adj900 = adjustedScale.find((s) => s.step === 900)!;

	return {
		scale: adjustedScale,
		wasAdjusted,
		meetsContrast,
		originalContrast,
		finalContrast: {
			pair100_800: chroma.contrast(adj100.color, adj800.color),
			pair200_900: chroma.contrast(adj200.color, adj900.color),
		},
	};
}

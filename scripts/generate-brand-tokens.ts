import fs from "node:fs/promises";
import path from "node:path";
import { generateBrandTokens } from "./lib/token-builder.ts";
import { sanitizeDomainName } from "./lib/file-utils.ts";

const INPUT_PATH = path.resolve(
	import.meta.dirname,
	"../primary-colors/primary-colors.json",
);
const OUTPUT_DIR = path.resolve(import.meta.dirname, "../brands");

interface BrandColors {
	primary: string;
	accentOne: string;
	"primary-text"?: string;
}

interface ReportEntry {
	domain: string;
	wasAdjusted: boolean;
	meetsContrast: boolean;
	originalContrast: { against100: number; against200: number };
	finalContrast: { against100: number; against200: number };
}

interface OnSurfaceIssue {
	domain: string;
	primaryColor: string;
	contrastWithWhite: number;
	contrastWithBlack: number;
	selectedValue: "white" | "black";
}

interface TextColorMismatch {
	domain: string;
	primaryColor: string;
	originalValue: string;
	calculatedValue: "white" | "black";
	contrastWithOriginal: number;
	contrastWithCalculated: number;
}

async function main() {
	console.log("Reading primary colors...");

	// Read input
	const inputData: Record<string, BrandColors> = JSON.parse(
		await fs.readFile(INPUT_PATH, "utf-8"),
	);

	// Ensure output directory exists
	await fs.mkdir(OUTPUT_DIR, { recursive: true });

	const report: {
		adjusted: ReportEntry[];
		failed: ReportEntry[];
		onSurfaceIssues: OnSurfaceIssue[];
		textColorMismatches: TextColorMismatch[];
	} = {
		adjusted: [],
		failed: [],
		onSurfaceIssues: [],
		textColorMismatches: [],
	};

	const brandCount = Object.keys(inputData).length;
	let processed = 0;

	console.log(`Processing ${brandCount} brands...`);

	for (const [domain, colors] of Object.entries(inputData)) {
		try {
			const { tokens, adjustments, onSurfaceContrast } = generateBrandTokens(
				domain,
				colors,
			);

			// Track adjustments
			const reportEntry: ReportEntry = {
				domain,
				...adjustments,
			};

			if (adjustments.wasAdjusted) {
				report.adjusted.push(reportEntry);
			}
			if (!adjustments.meetsContrast) {
				report.failed.push(reportEntry);
			}

			// Track onSurface contrast issues
			if (onSurfaceContrast && !onSurfaceContrast.meetsMinimum) {
				report.onSurfaceIssues.push({
					domain,
					primaryColor: colors.primary,
					contrastWithWhite: onSurfaceContrast.contrastWithWhite,
					contrastWithBlack: onSurfaceContrast.contrastWithBlack,
					selectedValue: onSurfaceContrast.selectedValue,
				});
			}

			// Track text color mismatches (original vs calculated)
			if (
				onSurfaceContrast &&
				onSurfaceContrast.originalValue &&
				onSurfaceContrast.matchesOriginal === false
			) {
				const calculatedValue =
					onSurfaceContrast.contrastWithWhite >= 4.5 ? "white" : "black";
				report.textColorMismatches.push({
					domain,
					primaryColor: colors.primary,
					originalValue: onSurfaceContrast.originalValue,
					calculatedValue,
					contrastWithOriginal:
						onSurfaceContrast.originalValue.toLowerCase() === "white"
							? onSurfaceContrast.contrastWithWhite
							: onSurfaceContrast.contrastWithBlack,
					contrastWithCalculated:
						calculatedValue === "white"
							? onSurfaceContrast.contrastWithWhite
							: onSurfaceContrast.contrastWithBlack,
				});
			}

			// Write output file
			const filename = sanitizeDomainName(domain) + ".json";
			await fs.writeFile(
				path.join(OUTPUT_DIR, filename),
				JSON.stringify(tokens, null, "\t"),
			);

			processed++;
			if (processed % 50 === 0) {
				console.log(`  Processed ${processed}/${brandCount} brands...`);
			}
		} catch (error) {
			console.error(
				`Error processing ${domain}:`,
				error instanceof Error ? error.message : error,
			);
			report.failed.push({
				domain,
				wasAdjusted: false,
				meetsContrast: false,
				originalContrast: { against100: 0, against200: 0 },
				finalContrast: { against100: 0, against200: 0 },
			});
		}
	}

	// Write report
	await fs.writeFile(
		path.join(OUTPUT_DIR, "_contrast-report.json"),
		JSON.stringify(report, null, 2),
	);

	console.log(`\nGenerated ${processed} brand token files`);
	console.log(`Adjusted: ${report.adjusted.length}`);
	console.log(`Failed to meet contrast: ${report.failed.length}`);
	console.log(
		`Primary-500 contrast issues (neither black nor white meets AA): ${report.onSurfaceIssues.length}`,
	);
	console.log(
		`Text color mismatches (original vs calculated): ${report.textColorMismatches.length}`,
	);
	console.log(`\nOutput directory: ${OUTPUT_DIR}`);
	console.log(`Contrast report: ${path.join(OUTPUT_DIR, "_contrast-report.json")}`);
}

main().catch(console.error);

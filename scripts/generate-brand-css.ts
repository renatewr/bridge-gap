import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";
import fs from "node:fs/promises";
import path from "node:path";

// Register tokens-studio transforms
register(StyleDictionary);

const BRANDS_DIR = path.resolve(import.meta.dirname, "../brands");
const OUTPUT_DIR = path.resolve(import.meta.dirname, "../css");

async function main() {
	console.log("Reading brand token files...");

	// Get all brand JSON files (excluding the report)
	const files = await fs.readdir(BRANDS_DIR);
	const brandFiles = files.filter(
		(f: string) => f.endsWith(".json") && !f.startsWith("_"),
	);

	console.log(`Found ${brandFiles.length} brand files`);

	// Ensure output directory exists
	await fs.mkdir(OUTPUT_DIR, { recursive: true });

	let processed = 0;

	for (const file of brandFiles) {
		const brandName = file.replace(".json", "");

		// Configure Style Dictionary for this brand
		const sd = new StyleDictionary({
			source: [path.join(BRANDS_DIR, file)],
			preprocessors: ["tokens-studio"],
			platforms: {
				css: {
					transforms: ["attribute/cti", "name/kebab"],
					buildPath: `${OUTPUT_DIR}/`,
					files: [
						{
							destination: `${brandName}.css`,
							format: "css/variables",
							options: {
								outputReferences: true,
							},
						},
					],
				},
			},
		});

		await sd.buildAllPlatforms();

		processed++;
		if (processed % 50 === 0) {
			console.log(`  Processed ${processed}/${brandFiles.length} brands...`);
		}
	}

	console.log(`\nGenerated ${processed} CSS files`);
	console.log(`Output directory: ${OUTPUT_DIR}`);
}

main().catch(console.error);

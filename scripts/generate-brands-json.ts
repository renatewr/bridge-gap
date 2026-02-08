import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";
import fs from "node:fs/promises";
import path from "node:path";

// Register tokens-studio transforms
register(StyleDictionary);

const BRANDS_DIR = path.resolve(import.meta.dirname, "../brands");
const OUTPUT_PATH = path.resolve(import.meta.dirname, "../dist/brands.json");

// Custom format to output JSON with resolved values but keep full token structure
const flatJsonFormat = {
	name: "json/flat-resolved",
	// biome-ignore lint/suspicious/noExplicitAny: Style Dictionary types are complex
	format: ({ dictionary }: { dictionary: any }) => {
		const result: Record<string, Record<string, unknown>> = {};
		for (const token of dictionary.allTokens) {
			// Build token with resolved $value but keep all metadata
			const tokenData: Record<string, unknown> = {
				$type: token.$type,
				$value: token.$value, // This is now resolved by Style Dictionary
			};

			// Include optional fields if present
			if (token.$description) tokenData.$description = token.$description;
			if (token.$usage) tokenData.$usage = token.$usage;
			if (token.$pairs) tokenData.$pairs = token.$pairs;
			if (token.$a11y) tokenData.$a11y = token.$a11y;

			result[token.name] = tokenData;
		}
		return JSON.stringify(result, null, "\t");
	},
};

async function main() {
	console.log("Building combined brands JSON...");

	// Get all brand JSON files (excluding the report)
	const files = await fs.readdir(BRANDS_DIR);
	const brandFiles = files.filter(
		(f: string) => f.endsWith(".json") && !f.startsWith("_"),
	);

	console.log(`Found ${brandFiles.length} brand files`);

	const allBrands: Record<string, Record<string, unknown>> = {};

	for (const file of brandFiles) {
		const brandName = file.replace(".json", "");

		// Configure Style Dictionary with tokens-studio transforms
		const sd = new StyleDictionary({
			source: [path.join(BRANDS_DIR, file)],
			preprocessors: ["tokens-studio"],
			hooks: {
				formats: {
					"json/flat-resolved": flatJsonFormat.format,
				},
				transforms: {
					"name/kebab": {
						type: "name",
						transform: (token) => {
							// Just join the path with hyphens (brand key already stripped by preprocessor)
							return token.path.join("-");
						},
					},
				},
			},
			platforms: {
				json: {
					transforms: ["ts/resolveMath", "ts/color/css/hexrgba", "attribute/cti", "name/kebab"],
					buildPath: "/tmp/sd-build/",
					files: [
						{
							destination: `${brandName}.json`,
							format: "json/flat-resolved",
						},
					],
				},
			},
		});

		// Build to temp directory
		await sd.buildAllPlatforms();

		// Read the generated file
		const generatedContent = await fs.readFile(
			`/tmp/sd-build/${brandName}.json`,
			"utf-8",
		);
		allBrands[brandName] = JSON.parse(generatedContent);
	}

	// Ensure output directory exists
	await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });

	// Write combined JSON
	await fs.writeFile(OUTPUT_PATH, JSON.stringify(allBrands, null, "\t"));

	console.log(`\nGenerated combined brands JSON with ${Object.keys(allBrands).length} brands`);
	console.log(`Output: ${OUTPUT_PATH}`);
}

main().catch(console.error);

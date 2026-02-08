import fs from "node:fs/promises";
import path from "node:path";

const CSS_DIR = path.resolve(import.meta.dirname, "../css");
const OUTPUT_PATH = path.resolve(import.meta.dirname, "../.storybook/brands.ts");

async function main() {
	const files = await fs.readdir(CSS_DIR);
	const brands = files
		.filter((f: string) => f.endsWith(".css"))
		.map((f: string) => f.replace(".css", ""))
		.sort();

	const content = `// Auto-generated list of brand themes
// Run: npm run generate-brand-list to update

export const brands = [
${brands.map((b: string) => `\t"${b}",`).join("\n")}
] as const;

export type Brand = (typeof brands)[number];
`;

	await fs.writeFile(OUTPUT_PATH, content);
	console.log(`Generated brand list with ${brands.length} brands`);
}

main().catch(console.error);

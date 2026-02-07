const fs = require("fs");
const path = require("path");

// Read the brands.json from dist folder
const brandsPath = path.join(__dirname, "../../dist/brands.json");
const uiTemplatePath = path.join(__dirname, "ui.template.html");
const uiOutputPath = path.join(__dirname, "ui.html");

console.log("Building brand palette plugin UI...");

// Read brands data
let brandsData;
try {
	const brandsContent = fs.readFileSync(brandsPath, "utf-8");
	brandsData = JSON.parse(brandsContent);
	console.log(`Loaded ${Object.keys(brandsData).length} brands`);
} catch (err) {
	console.error("Error reading brands.json:", err.message);
	process.exit(1);
}

// Read UI template
let uiContent;
try {
	uiContent = fs.readFileSync(uiTemplatePath, "utf-8");
} catch (err) {
	console.error("Error reading ui.html:", err.message);
	process.exit(1);
}

// Replace placeholder with actual data
const updatedUi = uiContent.replace(
	"__BRANDS_JSON__",
	JSON.stringify(brandsData)
);

// Write output
fs.writeFileSync(uiOutputPath, updatedUi);
console.log("UI built successfully!");

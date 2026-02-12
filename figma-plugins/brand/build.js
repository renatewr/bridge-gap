const fs = require("fs");
const path = require("path");

// Read the brands.json from dist folder and contrast report from brands folder
const brandsPath = path.join(__dirname, "../../dist/brands.json");
const contrastReportPath = path.join(__dirname, "../../brands/_contrast-report.json");
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

// Read contrast report data
let contrastReport;
try {
	const reportContent = fs.readFileSync(contrastReportPath, "utf-8");
	contrastReport = JSON.parse(reportContent);
	console.log(`Loaded contrast report with ${contrastReport.textColorMismatches?.length || 0} issues`);
} catch (err) {
	console.warn("Warning: Could not read contrast report:", err.message);
	contrastReport = { textColorMismatches: [] };
}

// Read UI template
let uiContent;
try {
	uiContent = fs.readFileSync(uiTemplatePath, "utf-8");
} catch (err) {
	console.error("Error reading ui.html:", err.message);
	process.exit(1);
}

// Replace placeholders with actual data
let updatedUi = uiContent.replace(
	"__BRANDS_JSON__",
	JSON.stringify(brandsData)
);

updatedUi = updatedUi.replace(
	"__CONTRAST_ISSUES_JSON__",
	JSON.stringify(contrastReport.textColorMismatches || [])
);

// Write output
fs.writeFileSync(uiOutputPath, updatedUi);
console.log("UI built successfully!");

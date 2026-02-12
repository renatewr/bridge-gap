import chroma from "chroma-js";

// Test colors that should fail contrast with both black and white
const testColors = [
  "#808080",  // Medium gray - should fail both
  "#888888",  // Light gray
  "#777777",  // Dark gray
];

const AA_THRESHOLD = 4.5;

console.log("Testing colors with poor contrast:\n");

for (const color of testColors) {
  const contrastWhite = chroma.contrast(color, "white");
  const contrastBlack = chroma.contrast(color, "black");
  const meetsMinimum = Math.max(contrastWhite, contrastBlack) >= AA_THRESHOLD;
  
  console.log(`Color: ${color}`);
  console.log(`  Contrast with white: ${contrastWhite.toFixed(2)}`);
  console.log(`  Contrast with black: ${contrastBlack.toFixed(2)}`);
  console.log(`  Meets AA (4.5): ${meetsMinimum ? "✓ YES" : "✗ NO"}`);
  console.log(`  Would use: ${contrastWhite >= AA_THRESHOLD ? "white" : "black"}`);
  console.log();
}

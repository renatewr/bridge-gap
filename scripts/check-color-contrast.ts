import chroma from "chroma-js";

const color = "#ED2026";
const fontSize = 15;

const contrastWithWhite = chroma.contrast(color, "white");
const contrastWithBlack = chroma.contrast(color, "black");

// WCAG 2.0 requirements:
// Normal text (< 18pt or < 14pt bold): AA = 4.5:1, AAA = 7:1
// Large text (>= 18pt or >= 14pt bold): AA = 3:1, AAA = 4.5:1
// 15px ≈ 11.25pt (normal text)

const AA_NORMAL = 4.5;
const AAA_NORMAL = 7.0;

console.log(`Color: ${color}`);
console.log(`Font size: ${fontSize}px (≈${(fontSize * 0.75).toFixed(2)}pt - normal text)\n`);

console.log("Contrast Ratios:");
console.log(`  Against WHITE: ${contrastWithWhite.toFixed(2)}:1`);
console.log(`  Against BLACK: ${contrastWithBlack.toFixed(2)}:1\n`);

console.log("WCAG AA (4.5:1 required for normal text):");
console.log(`  White: ${contrastWithWhite >= AA_NORMAL ? "✓ PASS" : "✗ FAIL"}`);
console.log(`  Black: ${contrastWithBlack >= AA_NORMAL ? "✓ PASS" : "✗ FAIL"}\n`);

console.log("WCAG AAA (7:1 required for normal text):");
console.log(`  White: ${contrastWithWhite >= AAA_NORMAL ? "✓ PASS" : "✗ FAIL"}`);
console.log(`  Black: ${contrastWithBlack >= AAA_NORMAL ? "✓ PASS" : "✗ FAIL"}\n`);

console.log("Recommendation:");
const bestContrast = Math.max(contrastWithWhite, contrastWithBlack);
if (bestContrast < AA_NORMAL) {
  console.log(`  ⚠️  Neither black nor white meets WCAG AA for 15px text!`);
  console.log(`  The primary color should be adjusted to achieve at least 4.5:1 contrast.`);
} else if (contrastWithWhite >= AA_NORMAL) {
  console.log(`  Use WHITE text on this background (${contrastWithWhite.toFixed(2)}:1 contrast)`);
  if (contrastWithWhite >= AAA_NORMAL) {
    console.log(`  ✓ Meets WCAG AAA standard`);
  }
} else {
  console.log(`  Use BLACK text on this background (${contrastWithBlack.toFixed(2)}:1 contrast)`);
  if (contrastWithBlack >= AAA_NORMAL) {
    console.log(`  ✓ Meets WCAG AAA standard`);
  }
}

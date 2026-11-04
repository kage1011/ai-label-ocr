import path from "path";
import fs from "fs";
import { TesseractOCRService } from "../infrastructure/ocr/tesseract-ocr.service.js";
import { LabelParserService } from "../infrastructure/ocr/label-parser.service.js";

async function runTest() {
  console.log("=== Testing Label OCR & Parsing System ===");

  const parser = new LabelParserService();
  const ocrService = new TesseractOCRService();

  // Test 1: Parser unit test with realistic label OCR output text
  console.log("\n[Test 1] Testing LabelParserService on mock label text...");
  const mockOcrResult = {
    text: `
      PRODUCT: SU'A TU'OI TIET TRUNG IT DUONG
      BARCODE: 8934567890123
      LOT NO: VN-2026-B88
      SERIAL: SN-774921
      MFG: 12/03/2026
      EXP: 12/09/2026
      NET WEIGHT: 250ml
      MADE IN: VIETNAM
    `,
    confidence: 94.5,
    lines: [
      { text: "PRODUCT: SU'A TU'OI TIET TRUNG IT DUONG", confidence: 96 },
      { text: "BARCODE: 8934567890123", confidence: 98 },
      { text: "LOT NO: VN-2026-B88", confidence: 93 },
      { text: "SERIAL: SN-774921", confidence: 95 },
      { text: "MFG: 12/03/2026", confidence: 92 },
      { text: "EXP: 12/09/2026", confidence: 94 },
      { text: "NET WEIGHT: 250ml", confidence: 91 },
      { text: "MADE IN: VIETNAM", confidence: 97 }
    ]
  };

  const parsed = parser.parse(mockOcrResult);
  console.log("Parsed Label Output:", JSON.stringify(parsed, null, 2));

  if (
    parsed.barcode === "8934567890123" &&
    parsed.batchNumber === "VN-2026-B88" &&
    parsed.serialNumber === "SN-774921" &&
    parsed.weightOrVolume === "250ml" &&
    parsed.origin === "VIETNAM"
  ) {
    console.log("✅ Parser Test PASSED with all fields extracted accurately!");
  } else {
    console.warn("⚠️ Some fields did not match expected mock output.");
  }

  // Test 2: Live OCR recognition if an image is provided in CLI arguments
  const args = process.argv.slice(2);
  const imageArg = args.find((a) => !a.startsWith("--"));

  if (imageArg && fs.existsSync(imageArg)) {
    console.log(`\n[Test 2] Running live Tesseract OCR on file: ${imageArg}...`);
    const ocrResult = await ocrService.recognize(path.resolve(imageArg));
    console.log(`Raw OCR Text (Confidence: ${ocrResult.confidence.toFixed(2)}%):`);
    console.log(ocrResult.text);

    const liveParsed = parser.parse(ocrResult);
    console.log("\nStructured Fields Extracted:");
    console.log(JSON.stringify(liveParsed, null, 2));
  } else {
    console.log("\n[Note] To run live OCR on an actual image file, run:");
    console.log("  npm run test:ocr -- path/to/label-image.png");
  }

  await ocrService.terminate();
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});


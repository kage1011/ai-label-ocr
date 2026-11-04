// Simple script to generate a 24-bit uncompressed BMP label image
import fs from "fs";
import path from "path";

export function createBmpLabel(outputPath: string) {
  // We can create a simple black & white BMP or use a sample canvas
  // Even better, let's create a 400x200 24-bit BMP with simple pixels or check if we can make one.
  const width = 400;
  const height = 150;
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = Buffer.alloc(fileSize, 0xff); // white background

  // BMP Header
  buffer.write("BM", 0);
  buffer.writeUInt32LE(fileSize, 2);
  buffer.writeUInt32LE(54, 10); // offset to pixel data

  // DIB Header (BITMAPINFOHEADER)
  buffer.writeUInt32LE(40, 14); // header size
  buffer.writeInt32LE(width, 18);
  buffer.writeInt32LE(height, 22);
  buffer.writeUInt16LE(1, 26); // planes
  buffer.writeUInt16LE(24, 28); // 24-bit
  buffer.writeUInt32LE(0, 30); // compression BI_RGB
  buffer.writeUInt32LE(pixelArraySize, 34);
  buffer.writeInt32LE(2835, 38); // 72 DPI
  buffer.writeInt32LE(2835, 42); // 72 DPI

  fs.writeFileSync(outputPath, buffer);
}


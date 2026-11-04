import { LabelParsedData } from "../../domain/value-objects/LabelParsedData.js";
import { OcrRawResult } from "./tesseract-ocr.service.js";

export class LabelParserService {
  parse(rawOcr: OcrRawResult): LabelParsedData {
    const rawText = rawOcr.text;
    const lines = rawOcr.lines.map((l) => l.text);
    const extractedFields: Record<string, string | null> = {};

    const barcode = this.extractBarcode(rawText, lines);
    const batchNumber = this.extractPattern(rawText, [
      /(?:LOT\s*(?:NO|NUMBER|#)|BATCH\s*(?:NO|NUMBER|#)|SO\s*LO|LOT|BATCH|LO|L[ÔO])\s*[:#.-]?\s*([A-Za-z0-9\-_/]+)/i
    ]);

    const serialNumber = this.extractPattern(rawText, [
      /(?:SERIAL\s*(?:NO|NUMBER|#)|SER\s*(?:NO|NUMBER|#)|S\/N|SERIAL|SER|SN)\s*[:#.-]?\s*([A-Za-z0-9\-_/]+)/i
    ]);

    const manufactureDate = this.extractDate(rawText, [
      /(?:MFG|NSX|PROD|MFR|NGAY SX)\s*[:#.-]?\s*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|\d{4}[/.-]\d{1,2}[/.-]\d{1,2})/i,
      /(?:DATE OF MFG|PRODUCTION DATE)\s*[:#.-]?\s*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|\d{4}[/.-]\d{1,2}[/.-]\d{1,2})/i
    ]);

    const expiryDate = this.extractDate(rawText, [
      /(?:EXP|HSD|USE BY|BEST BEFORE|EXPIRY|HAN SD)\s*[:#.-]?\s*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|\d{4}[/.-]\d{1,2}[/.-]\d{1,2})/i,
      /(?:EXP DATE|EXPIRY DATE)\s*[:#.-]?\s*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|\d{4}[/.-]\d{1,2}[/.-]\d{1,2})/i
    ]);

    const origin = this.extractPattern(rawText, [
      /(?:MADE IN|ORIGIN|XUAT XU|XUẤT XỨ)\s*[:#.-]?\s*([A-Za-z\s]+)/i,
      /(?:COUNTRY OF ORIGIN)\s*[:#.-]?\s*([A-Za-z\s]+)/i
    ]);

    const weightOrVolume = this.extractPattern(rawText, [
      /(?:NET WT|NET WEIGHT|WEIGHT|KL|THE TICH|VOLUME|KLT)\s*[:#.-]?\s*(\d+(?:\.\d+)?\s*(?:kg|g|mg|ml|l|oz|lbs))/i,
      /\b(\d+(?:\.\d+)?\s*(?:kg|g|mg|ml|l|oz|lbs))\b/i
    ]);

    const productName = this.extractProductName(rawText, lines);
    const materials = this.extractMaterials(rawText);

    extractedFields.barcode = barcode || null;
    extractedFields.productName = productName || null;
    extractedFields.batchNumber = batchNumber || null;
    extractedFields.serialNumber = serialNumber || null;
    extractedFields.origin = origin ? origin.trim() : null;
    extractedFields.weightOrVolume = weightOrVolume || null;
    if (materials.length > 0) {
      extractedFields.materials = materials.join(", ");
    }

    return {
      barcode: barcode || null,
      productName: productName || null,
      batchNumber: batchNumber || null,
      serialNumber: serialNumber || null,
      manufactureDate,
      expiryDate,
      origin: origin ? origin.trim() : null,
      weightOrVolume: weightOrVolume || null,
      rawText,
      confidence: Math.round(rawOcr.confidence * 100) / 100,
      extractedFields
    };
  }

  private extractMaterials(text: string): string[] {
    const regex = /\b\d{1,3}%\s*(?:POLYESTER|COTTON|SPANDEX|WOOL|SILK|NYLON|VISCOSE|RAYON|ACRYLIC|LINEN|ELASTANE|POLYAMIDE|MODAL)\b/gi;
    const matches = text.match(regex);
    return matches ? Array.from(new Set(matches.map((m) => m.trim().toUpperCase()))) : [];
  }

  private extractPattern(text: string, regexList: RegExp[]): string | null {
    for (const regex of regexList) {
      const match = text.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  private extractBarcode(text: string, lines: string[]): string | null {
    // Look for explicit prefix: BARCODE, SKU, CODE, ITEM NO
    const prefixMatch = text.match(/(?:BARCODE|SKU|CODE|ITEM NO|UPC|EAN)\s*[:#.-]?\s*([A-Za-z0-9\-_]{6,30})/i);
    if (prefixMatch && prefixMatch[1]) {
      return prefixMatch[1].trim();
    }

    // Look for standalone 12 to 14-digit numeric sequence (EAN-13, UPC, ITF)
    for (const line of lines) {
      const cleanLine = line.replace(/\s+/g, "");
      if (/^\d{8,14}$/.test(cleanLine)) {
        return cleanLine;
      }
      const match = line.match(/\b\d{8,14}\b/);
      if (match) {
        return match[0];
      }
    }

    // Look for alphanumeric product code e.g. ABC-123456
    const codeMatch = text.match(/\b[A-Z0-9]{3,8}-[A-Z0-9]{3,10}\b/);
    if (codeMatch) {
      return codeMatch[0];
    }

    return null;
  }

  private extractProductName(text: string, lines: string[]): string | null {
    // Check if line starts with Product / Name / Tên SP
    for (const line of lines) {
      const match = line.match(/(?:PRODUCT|NAME|TEN SP|TÊN SẢN PHẨM|ITEM)\s*[:#.-]?\s*(.+)/i);
      if (match && match[1] && match[1].trim().length > 2) {
        return match[1].trim();
      }
    }

    // Heuristic: The first non-empty line that doesn't contain pure dates/numbers or common headers
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.length > 3 &&
        !/^(mfg|exp|lot|batch|s\/n|serial|date|barcode|net wt|made in)/i.test(trimmed) &&
        !/^\d+$/.test(trimmed)
      ) {
        return trimmed;
      }
    }

    return null;
  }

  private extractDate(text: string, regexList: RegExp[]): Date | null {
    const rawDateStr = this.extractPattern(text, regexList);
    if (!rawDateStr) return null;

    try {
      // Normalize separators to /
      const normalized = rawDateStr.replace(/[.-]/g, "/");
      const parts = normalized.split("/").map((p) => parseInt(p, 10));

      if (parts.length === 3) {
        // YYYY/MM/DD
        if (parts[0] > 1900 && parts[1] <= 12 && parts[2] <= 31) {
          return new Date(parts[0], parts[1] - 1, parts[2]);
        }
        // DD/MM/YYYY or MM/DD/YYYY
        if (parts[2] > 1900) {
          // Assume DD/MM/YYYY for VN/INTL or MM/DD/YYYY
          const day = parts[0];
          const month = parts[1];
          const year = parts[2];
          if (month <= 12 && day <= 31) {
            return new Date(year, month - 1, day);
          }
        }
      }

      const parsed = new Date(rawDateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch {
      // Ignore date parsing failure
    }
    return null;
  }
}

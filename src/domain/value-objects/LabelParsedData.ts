export interface LabelParsedData {
  barcode?: string | null;
  productName?: string | null;
  batchNumber?: string | null;
  serialNumber?: string | null;
  manufactureDate?: Date | null;
  expiryDate?: Date | null;
  origin?: string | null;
  weightOrVolume?: string | null;
  rawText: string;
  confidence: number;
  extractedFields: Record<string, string | null>;
}


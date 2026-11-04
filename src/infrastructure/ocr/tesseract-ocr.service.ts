import { createWorker, Worker } from "tesseract.js";
import { ENV } from "../../config/env.js";

export interface OcrRawResult {
  text: string;
  confidence: number;
  lines: Array<{
    text: string;
    confidence: number;
  }>;
}

export class TesseractOCRService {
  private worker: Worker | null = null;
  private isInitializing: boolean = false;

  private async getWorker(): Promise<Worker> {
    if (this.worker) {
      return this.worker;
    }

    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (this.worker) return this.worker;
    }

    this.isInitializing = true;
    try {
      console.log(`[OCR] Initializing Tesseract worker for language: ${ENV.OCR.LANG}...`);
      const worker = await createWorker(ENV.OCR.LANG);
      this.worker = worker;
      console.log("[OCR] Tesseract worker ready.");
      return this.worker;
    } finally {
      this.isInitializing = false;
    }
  }

  async recognize(imageBufferOrPath: Buffer | string): Promise<OcrRawResult> {
    const worker = await this.getWorker();
    const result = await worker.recognize(imageBufferOrPath);

    const lines = (result.data.lines || []).map((line) => ({
      text: line.text.trim(),
      confidence: line.confidence
    })).filter((l) => l.text.length > 0);

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      lines
    };
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}


import { ILabelRepository, LabelFilterOptions, PaginatedResult } from "../../domain/repositories/ILabelRepository.js";
import { IScanLogRepository } from "../../domain/repositories/IScanLogRepository.js";
import { Label, LabelStatus } from "../../domain/entities/Label.js";
import { ScanLog } from "../../domain/entities/ScanLog.js";
import { TesseractOCRService } from "../../infrastructure/ocr/tesseract-ocr.service.js";
import { LabelParserService } from "../../infrastructure/ocr/label-parser.service.js";
import { CreateLabelDto, UpdateLabelDto } from "../dtos/label.dto.js";

export interface ScanLabelOptions {
  filePath: string;
  originalFileName?: string;
  clientIp?: string;
  autoSave?: boolean;
}

export interface ScanResultResponse {
  label: Label | null;
  parsedFields: Record<string, string | null>;
  rawText: string;
  confidence: number;
  isPersistedToDatabase: boolean;
  scanLog?: ScanLog | null;
}

export class LabelScanService {
  constructor(
    private labelRepo: ILabelRepository,
    private scanLogRepo: IScanLogRepository,
    private ocrService: TesseractOCRService,
    private parserService: LabelParserService
  ) {}

  async scanLabel(options: ScanLabelOptions): Promise<ScanResultResponse> {
    const startTime = Date.now();
    let isSuccess = false;
    let errorMessage: string | null = null;
    let rawOcrResult;

    try {
      rawOcrResult = await this.ocrService.recognize(options.filePath);
      isSuccess = true;
    } catch (err: any) {
      errorMessage = err?.message || "Failed to execute OCR on label image";
      throw new Error(`OCR Processing Failed: ${errorMessage}`);
    }

    const durationMs = Date.now() - startTime;
    const parsedData = this.parserService.parse(rawOcrResult);

    let savedLabel: Label | null = null;
    let scanLog: ScanLog | null = null;
    let isPersistedToDatabase = false;

    try {
      const labelEntity = await this.labelRepo.create({
        barcode: parsedData.barcode,
        productName: parsedData.productName,
        batchNumber: parsedData.batchNumber,
        serialNumber: parsedData.serialNumber,
        manufactureDate: parsedData.manufactureDate,
        expiryDate: parsedData.expiryDate,
        origin: parsedData.origin,
        weightOrVolume: parsedData.weightOrVolume,
        rawText: parsedData.rawText,
        confidence: parsedData.confidence,
        imagePath: options.filePath,
        status: LabelStatus.DRAFT,
        metadata: JSON.stringify(parsedData.extractedFields)
      });

      savedLabel = await this.labelRepo.save(labelEntity);

      scanLog = await this.scanLogRepo.save({
        labelId: savedLabel.id,
        engine: "Tesseract.js",
        durationMs,
        confidence: parsedData.confidence,
        success: true,
        originalFileName: options.originalFileName,
        clientIp: options.clientIp
      } as ScanLog);

      isPersistedToDatabase = true;
    } catch (dbErr: any) {
      console.warn("[Database Warning] Could not persist label to SQL Server:", dbErr.message);
    }

    return {
      label: savedLabel,
      parsedFields: parsedData.extractedFields,
      rawText: parsedData.rawText,
      confidence: parsedData.confidence,
      isPersistedToDatabase,
      scanLog
    };
  }

  async createManualLabel(dto: CreateLabelDto): Promise<Label> {
    const label = await this.labelRepo.create({
      ...dto,
      manufactureDate: dto.manufactureDate ? new Date(dto.manufactureDate) : null,
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
      status: dto.status || LabelStatus.DRAFT
    });
    return this.labelRepo.save(label);
  }

  async getLabelById(id: string): Promise<Label | null> {
    return this.labelRepo.findById(id);
  }

  async getLabelsByBarcode(barcode: string): Promise<Label[]> {
    return this.labelRepo.findByBarcode(barcode);
  }

  async listLabels(options: LabelFilterOptions): Promise<PaginatedResult<Label>> {
    return this.labelRepo.findPaginated(options);
  }

  async updateLabel(id: string, dto: UpdateLabelDto): Promise<Label | null> {
    const updateData: Partial<Label> = {
      ...dto,
      manufactureDate: dto.manufactureDate ? new Date(dto.manufactureDate) : undefined,
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      metadata: dto.metadata ? JSON.stringify(dto.metadata) : undefined
    };
    return this.labelRepo.update(id, updateData);
  }

  async deleteLabel(id: string): Promise<boolean> {
    return this.labelRepo.delete(id);
  }

  async getRecentScanLogs(limit: number = 20): Promise<ScanLog[]> {
    return this.scanLogRepo.getRecentLogs(limit);
  }
}


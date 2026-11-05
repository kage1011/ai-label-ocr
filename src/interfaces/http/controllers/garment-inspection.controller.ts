import { Request, Response, NextFunction } from "express";
import { GarmentInspectorService } from "../../../application/services/garment-inspector.service.js";
import { TesseractOCRService } from "../../../infrastructure/ocr/tesseract-ocr.service.js";
import { GarmentLabelType } from "../../../domain/value-objects/GarmentInspection.js";
import { AppDataSource } from "../../../infrastructure/database/typeorm-datasource.js";
import { GarmentInspectionRecord } from "../../../domain/entities/GarmentInspectionRecord.js";

export class GarmentInspectionController {
  constructor(
    private garmentInspector: GarmentInspectorService,
    private ocrService: TesseractOCRService
  ) {}

  /**
   * Endpoint 1: Kiểm tra nhanh từ dữ liệu text đã bóc tách hoặc từ client gửi lên
   * POST /api/v1/garment-inspections/validate
   */
  validateText = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { garmentSku, orderId, labels, requiredLabelTypes } = req.body;

      if (!labels || !Array.isArray(labels) || labels.length === 0) {
        res.status(400).json({
          success: false,
          message: "Danh sách 'labels' không được để trống. Cần truyền mảng gồm các tem kèm nội dung rawText."
        });
        return;
      }

      const result = this.garmentInspector.inspectGarment({
        garmentSku,
        orderId,
        labels,
        requiredLabelTypes
      });

      // Lưu kết quả vào database nếu SQL Server đang chạy
      await this.saveInspectionRecord({
        orderId,
        garmentSku,
        result
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Endpoint 2: Quét ảnh trực tiếp từ 3 file tem tải lên (sizeLabel, careLabel, hangTag)
   * POST /api/v1/garment-inspections/scan-images
   */
  scanAndValidateImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      if (!files) {
        res.status(400).json({
          success: false,
          message: "Vui lòng tải lên các ảnh tem: sizeLabel, careLabel, hangTag"
        });
        return;
      }

      const labelInputs: Array<{
        labelType: GarmentLabelType;
        rawText: string;
        confidence: number;
      }> = [];

      const targetFields: Array<{ field: string; type: GarmentLabelType }> = [
        { field: "sizeLabel", type: "SIZE_LABEL" },
        { field: "careLabel", type: "CARE_LABEL" },
        { field: "hangTag", type: "HANG_TAG" }
      ];

      for (const { field, type } of targetFields) {
        const fileList = files[field];
        if (fileList && fileList.length > 0) {
          const file = fileList[0];
          const ocrResult = await this.ocrService.recognize(file.path);
          labelInputs.push({
            labelType: type,
            rawText: ocrResult.text,
            confidence: ocrResult.confidence
          });
        }
      }

      const result = this.garmentInspector.inspectGarment({
        garmentSku: req.body.garmentSku,
        orderId: req.body.orderId,
        labels: labelInputs
      });

      // Lưu kết quả vào database
      await this.saveInspectionRecord({
        orderId: req.body.orderId,
        garmentSku: req.body.garmentSku,
        result
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Endpoint 3: Lấy lịch sử kiểm tra sản phẩm
   * GET /api/v1/garment-inspections/history
   */
  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!AppDataSource.isInitialized) {
        res.status(200).json({
          success: true,
          message: "SQL Server is offline or not configured.",
          data: []
        });
        return;
      }

      const repo = AppDataSource.getRepository(GarmentInspectionRecord);
      const records = await repo.find({
        order: { createdAt: "DESC" },
        take: 50
      });

      res.status(200).json({
        success: true,
        data: records
      });
    } catch (error) {
      next(error);
    }
  };

  private async saveInspectionRecord(params: {
    orderId?: string;
    garmentSku?: string;
    result: ReturnType<GarmentInspectorService["inspectGarment"]>;
  }): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) return;
      const repo = AppDataSource.getRepository(GarmentInspectionRecord);
      const record = repo.create({
        orderId: params.orderId || null,
        garmentSku: params.garmentSku || null,
        status: params.result.status,
        matchedSize: params.result.matchedSize || null,
        failureReason: params.result.reason || null,
        summaryMessage: params.result.summaryMessage,
        labelsJson: JSON.stringify(params.result.inspectedLabels),
        executionTimeMs: params.result.executionTimeMs
      });
      await repo.save(record);
    } catch (err) {
      console.warn("[InspectionLog] Failed to persist inspection record:", err);
    }
  }
}

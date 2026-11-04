import { Request, Response, NextFunction } from "express";
import { LabelScanService } from "../../../application/services/label-scan.service.js";
import {
  CreateLabelSchema,
  UpdateLabelSchema,
  QueryLabelSchema
} from "../../../application/dtos/label.dto.js";

export class LabelController {
  constructor(private scanService: LabelScanService) {}

  scanImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No image file uploaded. Please upload a label image using field 'image'."
        });
        return;
      }

      const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const result = await this.scanService.scanLabel({
        filePath: req.file.path,
        originalFileName: req.file.originalname,
        clientIp
      });

      res.status(201).json({
        success: true,
        message: result.isPersistedToDatabase
          ? "Label scanned, processed, and stored into SQL Server successfully"
          : "Label scanned and processed successfully (SQL Server is offline, data not persisted)",
        data: {
          label: result.label,
          extractedFields: result.parsedFields,
          rawText: result.rawText,
          confidence: result.confidence,
          isPersistedToDatabase: result.isPersistedToDatabase,
          scanLog: result.scanLog
        }
      });
    } catch (error) {
      next(error);
    }
  };

  createLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = CreateLabelSchema.parse(req.body);
      const label = await this.scanService.createManualLabel(validated);

      res.status(201).json({
        success: true,
        message: "Label created and saved to SQL Server successfully",
        data: label
      });
    } catch (error) {
      next(error);
    }
  };

  getLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const label = await this.scanService.getLabelById(id);

      if (!label) {
        res.status(404).json({
          success: false,
          message: `Label with ID '${id}' not found in database.`
        });
        return;
      }

      res.json({
        success: true,
        data: label
      });
    } catch (error) {
      next(error);
    }
  };

  getLabelsByBarcode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const barcode = String(req.params.barcode);
      const labels = await this.scanService.getLabelsByBarcode(barcode);

      res.json({
        success: true,
        count: labels.length,
        data: labels
      });
    } catch (error) {
      next(error);
    }
  };

  listLabels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = QueryLabelSchema.parse(req.query);

      const filterOptions = {
        barcode: query.barcode,
        productName: query.productName,
        batchNumber: query.batchNumber,
        status: query.status,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        page: query.page,
        limit: query.limit
      };

      const result = await this.scanService.listLabels(filterOptions);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  updateLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const validated = UpdateLabelSchema.parse(req.body);

      const updated = await this.scanService.updateLabel(id, validated);
      if (!updated) {
        res.status(404).json({
          success: false,
          message: `Label with ID '${id}' not found.`
        });
        return;
      }

      res.json({
        success: true,
        message: "Label updated successfully in SQL Server",
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  deleteLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const deleted = await this.scanService.deleteLabel(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: `Label with ID '${id}' not found.`
        });
        return;
      }

      res.json({
        success: true,
        message: "Label deleted successfully from SQL Server"
      });
    } catch (error) {
      next(error);
    }
  };

  getRecentLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt((req.query.limit as string) || "20", 10);
      const logs = await this.scanService.getRecentScanLogs(limit);

      res.json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  };
}

import { Request, Response } from "express";
import { AppDataSource } from "../../../infrastructure/database/typeorm-datasource.js";

export class HealthController {
  check = async (_req: Request, res: Response): Promise<void> => {
    const isDbConnected = AppDataSource.isInitialized;

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          type: "Microsoft SQL Server",
          status: isDbConnected ? "CONNECTED" : "DISCONNECTED"
        },
        ocr: {
          engine: "Tesseract.js",
          status: "READY"
        }
      }
    });
  };
}


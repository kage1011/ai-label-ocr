import { ENV } from "./config/env.js";
import { AppDataSource, initializeDatabase } from "./infrastructure/database/typeorm-datasource.js";
import { TypeORMLabelRepository } from "./infrastructure/repositories/TypeORMLabelRepository.js";
import { TypeORMScanLogRepository } from "./infrastructure/repositories/TypeORMScanLogRepository.js";
import { TesseractOCRService } from "./infrastructure/ocr/tesseract-ocr.service.js";
import { LabelParserService } from "./infrastructure/ocr/label-parser.service.js";
import { LabelScanService } from "./application/services/label-scan.service.js";
import { LabelController } from "./interfaces/http/controllers/label.controller.js";
import { HealthController } from "./interfaces/http/controllers/health.controller.js";
import { createServer } from "./interfaces/http/server.js";

async function bootstrap() {
  console.log("====================================================");
  console.log("    Starting AI Label OCR System (TypeScript)       ");
  console.log("====================================================");

  // 1. Initialize SQL Server Connection via TypeORM
  let isDbReady = false;
  try {
    await initializeDatabase();
    isDbReady = true;
  } catch (err) {
    console.warn("[Warning] SQL Server connection failed at startup. Will operate in degraded mode until DB is available.");
    console.warn(`[Warning] Please verify MSSQL Server credentials in .env (DB_HOST=${ENV.DB.HOST}, DB_PORT=${ENV.DB.PORT}, DB_DATABASE=${ENV.DB.DATABASE})`);
  }

  // 2. Initialize Repositories (Infrastructure Layer)
  const labelRepo = new TypeORMLabelRepository(AppDataSource);
  const scanLogRepo = new TypeORMScanLogRepository(AppDataSource);

  // 3. Initialize OCR & Domain Services
  const ocrService = new TesseractOCRService();
  const parserService = new LabelParserService();
  const scanService = new LabelScanService(labelRepo, scanLogRepo, ocrService, parserService);

  // 4. Initialize Controllers & HTTP Server
  const labelController = new LabelController(scanService);
  const healthController = new HealthController();
  const app = createServer(labelController, healthController);

  const server = app.listen(ENV.PORT, () => {
    console.log(`[Server] HTTP Server listening on port ${ENV.PORT}`);
    console.log(`[Server] Health check: http://localhost:${ENV.PORT}/api/v1/health`);
    console.log(`[Server] Label scan endpoint: POST http://localhost:${ENV.PORT}/api/v1/labels/scan (form-data field 'image')`);
    console.log(`[Server] Architecture diagram: http://localhost:${ENV.PORT}/docs/architecture-diagram.html`);
  });

  // Graceful Shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[Shutdown] Received ${signal}. Closing resources...`);
    server.close(async () => {
      await ocrService.terminate();
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
      console.log("[Shutdown] Cleanup finished. Exiting process.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  console.error("[Fatal] Application bootstrap crashed:", error);
  process.exit(1);
});


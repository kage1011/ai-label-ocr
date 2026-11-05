import { ENV } from "./config/env.js";
import { AppDataSource, initializeDatabase } from "./infrastructure/database/typeorm-datasource.js";
import { TesseractOCRService } from "./infrastructure/ocr/tesseract-ocr.service.js";
import { GarmentInspectorService } from "./application/services/garment-inspector.service.js";
import { HealthController } from "./interfaces/http/controllers/health.controller.js";
import { GarmentInspectionController } from "./interfaces/http/controllers/garment-inspection.controller.js";
import { createServer } from "./interfaces/http/server.js";

async function bootstrap() {
  console.log("==========================================================");
  console.log("  Starting Garment Multi-Label Size Inspection System     ");
  console.log("==========================================================");

  // 1. Initialize SQL Server Connection (Optional / Degraded mode supported)
  try {
    await initializeDatabase();
  } catch {
    console.warn("[Warning] SQL Server connection failed at startup. System will operate in offline audit mode.");
    console.warn(`[Warning] Please verify MSSQL Server credentials in .env if persistence is required.`);
  }

  // 2. Initialize Services
  const ocrService = new TesseractOCRService();
  const garmentInspector = new GarmentInspectorService();

  // 3. Initialize Controllers & HTTP Server
  const healthController = new HealthController();
  const garmentController = new GarmentInspectionController(garmentInspector, ocrService);

  const app = createServer(healthController, garmentController);

  const server = app.listen(ENV.PORT, () => {
    console.log(`[Server] HTTP Server listening on port ${ENV.PORT}`);
    console.log(`[Server] Health check: http://localhost:${ENV.PORT}/api/v1/health`);
    console.log(`[Server] Garment Inspection (JSON): POST http://localhost:${ENV.PORT}/api/v1/garment-inspections/validate`);
    console.log(`[Server] Garment Inspection (Images): POST http://localhost:${ENV.PORT}/api/v1/garment-inspections/scan-images`);
    console.log(`[Server] Inspection History: GET http://localhost:${ENV.PORT}/api/v1/garment-inspections/history`);
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

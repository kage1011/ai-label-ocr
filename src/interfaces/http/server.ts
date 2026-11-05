import express, { Application } from "express";
import cors from "cors";
import path from "path";
import { ENV } from "../../config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { createApiRouter } from "./routes/api.routes.js";
import { HealthController } from "./controllers/health.controller.js";
import { GarmentInspectionController } from "./controllers/garment-inspection.controller.js";

export function createServer(
  healthController: HealthController,
  garmentController: GarmentInspectionController
): Application {
  const app = express();

  // Basic Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files for uploaded images
  app.use("/uploads", express.static(ENV.UPLOAD.DIR));

  // API Routes
  const apiRouter = createApiRouter(healthController, garmentController);
  app.use("/api/v1", apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

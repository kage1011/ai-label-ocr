import express, { Application } from "express";
import cors from "cors";
import path from "path";
import { ENV } from "../../config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { createApiRouter } from "./routes/api.routes.js";
import { LabelController } from "./controllers/label.controller.js";
import { HealthController } from "./controllers/health.controller.js";

export function createServer(
  labelController: LabelController,
  healthController: HealthController
): Application {
  const app = express();

  // Basic Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files for uploaded images & generated docs
  app.use("/uploads", express.static(ENV.UPLOAD.DIR));
  app.use("/docs", express.static(path.resolve(process.cwd(), "docs")));

  // API Routes
  const apiRouter = createApiRouter(labelController, healthController);
  app.use("/api/v1", apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}


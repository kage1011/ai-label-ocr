import { Router } from "express";
import { LabelController } from "../controllers/label.controller.js";
import { HealthController } from "../controllers/health.controller.js";
import { createLabelRouter } from "./label.routes.js";

export function createApiRouter(
  labelController: LabelController,
  healthController: HealthController
): Router {
  const router = Router();

  router.use("/health", healthController.check);
  router.use("/labels", createLabelRouter(labelController));

  return router;
}


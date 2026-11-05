import { Router } from "express";
import { HealthController } from "../controllers/health.controller.js";
import { GarmentInspectionController } from "../controllers/garment-inspection.controller.js";
import { createGarmentInspectionRouter } from "./garment-inspection.routes.js";

export function createApiRouter(
  healthController: HealthController,
  garmentController: GarmentInspectionController
): Router {
  const router = Router();

  router.use("/health", healthController.check);
  router.use("/garment-inspections", createGarmentInspectionRouter(garmentController));

  return router;
}

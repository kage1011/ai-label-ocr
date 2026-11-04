import { Router } from "express";
import { LabelController } from "../controllers/label.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

export function createLabelRouter(labelController: LabelController): Router {
  const router = Router();

  // Scan & OCR endpoint
  router.post("/scan", upload.single("image"), labelController.scanImage);

  // Audit Logs
  router.get("/logs/recent", labelController.getRecentLogs);

  // Search by Barcode
  router.get("/barcode/:barcode", labelController.getLabelsByBarcode);

  // Standard CRUD endpoints
  router.get("/", labelController.listLabels);
  router.post("/", labelController.createLabel);
  router.get("/:id", labelController.getLabel);
  router.put("/:id", labelController.updateLabel);
  router.delete("/:id", labelController.deleteLabel);

  return router;
}


import { Router } from "express";
import { GarmentInspectionController } from "../controllers/garment-inspection.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

export function createGarmentInspectionRouter(
  controller: GarmentInspectionController
): Router {
  const router = Router();

  // 1. Kiểm tra nhanh từ JSON payload
  router.post("/validate", controller.validateText);

  // 2. Tải lên 3 ảnh tem (hoặc ít nhất 1 ảnh tem) để OCR và so sánh tự động
  router.post(
    "/scan-images",
    upload.fields([
      { name: "sizeLabel", maxCount: 1 },
      { name: "careLabel", maxCount: 1 },
      { name: "hangTag", maxCount: 1 }
    ]),
    controller.scanAndValidateImages
  );

  // 3. Lịch sử kiểm tra gần nhất
  router.get("/history", controller.getHistory);

  return router;
}

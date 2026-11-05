# Technical Plan: Garment Multi-Label Size Inspection

**Feature ID**: 001-garment-size-inspection  
**Architecture Pattern**: Clean Architecture (Hexagonal)  

---

## 1. System Components
- **Domain Layer**:
  - `src/domain/value-objects/GarmentInspection.ts`: Core models, types (`GarmentLabelType`, `InspectionStatus`), results.
  - `src/domain/entities/GarmentInspectionRecord.ts`: TypeORM Entity for MS SQL Server audit log.
- **Application Layer**:
  - `src/application/services/garment-inspector.service.ts`: Regex parser, size normalization map, multi-label cross-comparison engine.
- **Infrastructure Layer**:
  - `src/infrastructure/ocr/tesseract-ocr.service.ts`: Local OCR engine.
  - `src/infrastructure/database/typeorm-datasource.ts`: MSSQL DataSource.
- **Interface Layer**:
  - `src/interfaces/http/controllers/garment-inspection.controller.ts`: REST Endpoints (`/validate`, `/scan-images`, `/history`).
  - `src/interfaces/http/routes/garment-inspection.routes.ts`: Routing logic.

---

## 2. API Contract
- `POST /api/v1/garment-inspections/validate`:
  ```json
  {
    "garmentSku": "POLO-SHIRT-M-NAVY",
    "labels": [
      { "labelType": "SIZE_LABEL", "rawText": "SIZE: M" },
      { "labelType": "CARE_LABEL", "rawText": "SIZE: M" },
      { "labelType": "HANG_TAG", "rawText": "SIZE: M" }
    ]
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "data": {
      "status": "PASS",
      "isPass": true,
      "matchedSize": "M",
      "summaryMessage": "🟢 PASS: Tất cả các tem đều đồng nhất Size [M]",
      "shouldAlarm": false,
      "executionTimeMs": 0
    }
  }
  ```


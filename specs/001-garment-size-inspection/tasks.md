# Implementation Tasks: Garment Multi-Label Size Inspection

**Feature ID**: 001-garment-size-inspection  

---

## Task Checklist

- [x] **Task 1: Define Domain Models**
  - [x] Create `src/domain/value-objects/GarmentInspection.ts`.
  - [x] Define `GarmentLabelType` (`SIZE_LABEL`, `CARE_LABEL`, `HANG_TAG`).
  - [x] Define `InspectionStatus` (`PASS`, `NG`) and failure reasons.

- [x] **Task 2: Implement Matching Engine**
  - [x] Create `src/application/services/garment-inspector.service.ts`.
  - [x] Implement `extractSize()` with prefix matching and jeans waist recognition (`W: 32 L: 32`).
  - [x] Implement `normalizeSize()` (`2XL` == `XXL`).
  - [x] Implement multi-label cross comparison with alarm triggers.

- [x] **Task 3: Automated Testing & Benchmarking**
  - [x] Create `src/scripts/test-garment-inspection.ts`.
  - [x] Add 5 realistic factory test scenarios.
  - [x] Benchmark 1,000 iterations to verify latency (< 2s requirement).

- [x] **Task 4: Interface & API Endpoints**
  - [x] Create `GarmentInspectionController`.
  - [x] Expose `POST /api/v1/garment-inspections/validate`.
  - [x] Expose `POST /api/v1/garment-inspections/scan-images`.
  - [x] Expose `GET /api/v1/garment-inspections/history`.

- [x] **Task 5: SQL Server Audit Trail**
  - [x] Create `GarmentInspectionRecord` TypeORM Entity.
  - [x] Update database datasource and T-SQL schema.


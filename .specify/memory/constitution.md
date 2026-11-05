# AI Garment Multi-Label Size Inspection System Constitution

## Core Principles

### I. Real-Time Latency Standard (< 2 Seconds Target, < 200ms Engine)
- The entire inspection cycle (Capture → Detect → OCR → Match → Decide PASS/NG) must return immediate feedback to the garment workstation worker.
- Core rule matching must complete in sub-millisecond time (< 1ms).
- Edge execution is preferred over cloud APIs to avoid network round-trip delays and internet dependency.

### II. Clean Architecture & Domain Integrity
- The system strictly adheres to Clean Architecture:
  - `Domain`: Enterprise rules (Label Types, Garment Inspection models, PASS/NG state).
  - `Application`: Use-case services (Garment Inspector, size normalizer).
  - `Infrastructure`: OCR engine (Tesseract.js/OpenVINO), SQL Server persistence (TypeORM).
  - `Interfaces`: HTTP presentation, controllers, and middlewares.
- Business rules never depend on external frameworks, databases, or UI drivers.

### III. Robust Size Extraction & Normalization
- All real-world size formats must be supported without false negatives:
  - Letter sizes (`XXS`, `XS`, `S`, `M`, `L`, `XL`, `2XL`, `3XL`...).
  - Numeric sizes (`26` - `54`).
  - Waist/Inseam notation for Jeans (`W: 32 L: 32` - must distinguish Waist 32 from size L).
  - Multi-market variations (`2XL` == `XXL`).
- If any required label is missing or unreadable, the system must trigger `NG` with a descriptive reason.

### IV. Spec-Driven Development (SDD - Non-Negotiable)
- All new features and major refactorings must follow the Spec-Kit pipeline:
  1. **Specify**: Define functional and operational requirements in `specs/<feature-name>/spec.md`.
  2. **Plan**: Establish technical design, data schemas, and API contracts in `specs/<feature-name>/plan.md`.
  3. **Tasks**: Break down implementation into checklist items in `specs/<feature-name>/tasks.md`.
  4. **Implement & Verify**: Execute tasks against test cases and benchmarks.

### V. Traceability & Audit Logging
- Every single garment checked on the line must produce an immutable audit log record:
  - `orderId`, `garmentSku`, `status` (PASS/NG), `matchedSize`, `failureReason`, `executionTimeMs`, `timestamp`.
  - Stored in Microsoft SQL Server (`GarmentInspectionRecords`).

## Governance
- This Constitution defines the ground rules for all human developers and AI pair programmers working on this repository.
- Changes to core inspection logic require automated regression tests covering all 5 baseline scenarios.

**Version**: 1.0.0 | **Ratified**: 2026-11-05

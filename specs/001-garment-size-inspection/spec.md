# Feature Specification: Garment Multi-Label Size Inspection

**Feature ID**: 001-garment-size-inspection  
**Status**: Implemented & Verified  
**Owner**: AI Quality Control Team  

---

## 1. Background & Business Problem
In export garment manufacturing (PQC/FQC lines), workers must verify that all labels attached to a single garment indicate the exact same size:
1. **Size Label**: Neck/waist tag.
2. **Care Label**: Side seam washing and fabric instruction label.
3. **Hang Tag**: Cardboard retail brand tag.

Human verification is prone to fatigue, leading to packing mislabeled sizes (e.g. Garment size M with a size L Hang Tag).

---

## 2. Requirements & User Scenarios

### User Scenario 1: All Labels Match
- **Input**: Size Label: `M`, Care Label: `M`, Hang Tag: `M`.
- **Expected Outcome**:
  - State: `PASS`
  - Feedback: Soft single chime / Green indicator
  - Worker continues folding and packing.

### User Scenario 2: Size Mismatch
- **Input**: Size Label: `M`, Care Label: `M`, Hang Tag: `L`.
- **Expected Outcome**:
  - State: `NG`
  - Reason: `SIZE_MISMATCH`
  - Feedback: Continuous buzzer alarm / Red screen highlight pinpointing the Hang Tag.

### User Scenario 3: Missing Required Label
- **Input**: Size Label: `S`, Hang Tag: `S` (Missing Care Label).
- **Expected Outcome**:
  - State: `NG`
  - Reason: `MISSING_REQUIRED_LABEL`

### User Scenario 4: Variant Formatting
- **Input**: Size Label: `2XL`, Care Label: `XXL`, Hang Tag: `2XL`.
- **Expected Outcome**:
  - State: `PASS` (Normalized size: `2XL`).

### Non-Functional Requirements:
- End-to-end response time under **2 seconds** per garment.
- Core matching engine execution time under **1 ms**.


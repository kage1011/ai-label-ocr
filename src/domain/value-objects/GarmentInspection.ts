export type GarmentLabelType =
  | "SIZE_LABEL"   // Tem size ở cổ áo / cạp quần
  | "CARE_LABEL"   // Tem hướng dẫn giặt / chăm sóc sườn áo
  | "HANG_TAG"     // Thẻ bài / tem treo giấy
  | "PRICE_TAG"    // Tem giá
  | "OTHER";       // Tem phụ khác

export type InspectionStatus = "PASS" | "NG";

export type InspectionFailureReason =
  | "SIZE_MISMATCH"            // Các tem lệch size nhau
  | "MISSING_REQUIRED_LABEL"   // Thiếu tem theo quy định đơn hàng
  | "SIZE_NOT_FOUND"           // Không đọc được size trên tem
  | "OCR_CONFIDENCE_LOW";      // Độ tin cậy hình ảnh quá thấp, cần quét lại

export interface InspectedLabel {
  labelType: GarmentLabelType;
  rawText: string;
  detectedSize: string | null;
  normalizedSize: string | null;
  confidence: number;
}

export interface GarmentInspectionInput {
  orderId?: string;
  garmentSku?: string;
  labels: Array<{
    labelType: GarmentLabelType;
    rawText: string;
    confidence?: number;
  }>;
  requiredLabelTypes?: GarmentLabelType[]; // Mặc định: SIZE_LABEL, CARE_LABEL, HANG_TAG
}

export interface GarmentInspectionResult {
  status: InspectionStatus;
  isPass: boolean;
  matchedSize: string | null;
  summaryMessage: string;
  reason?: InspectionFailureReason;
  detailedDiscrepancies?: string[];
  inspectedLabels: InspectedLabel[];
  executionTimeMs: number;
  shouldAlarm: boolean; // True nếu NG để kích hoạt còi/đèn đỏ
}


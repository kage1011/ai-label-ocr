import {
  GarmentInspectionInput,
  GarmentInspectionResult,
  GarmentLabelType,
  InspectedLabel
} from "../../domain/value-objects/GarmentInspection.js";

export class GarmentInspectorService {
  /**
   * Danh sách các tem bắt buộc mặc định trên 1 sản phẩm may mặc xuất khẩu
   */
  private readonly defaultRequiredLabels: GarmentLabelType[] = [
    "SIZE_LABEL",
    "CARE_LABEL",
    "HANG_TAG"
  ];

  /**
   * Bóc tách kích cỡ (Size) từ nội dung văn bản OCR của tem
   */
  public extractSize(text: string): string | null {
    if (!text || text.trim().length === 0) return null;

    const cleanText = text.toUpperCase();

    // 1. Tìm theo tiền tố rõ ràng (Ưu tiên cao nhất): SIZE:, SZ:, SIZE / TAILLE:
    const prefixPatterns = [
      /(?:SIZE|KICH CO|KÍCH CỠ|CỠ|SZ|SIZE\/TAILLE|TAILLE|TALLA)\s*[:#.-]?\s*([0-9]{1,3}[A-Z]?|[0-9]XL|X{1,4}[SL]|S|M|L|ONE\s*SIZE|FREE\s*SIZE)\b/i,
      /(?:US|USA|EUR|EU|INTL|ASIA)\s*[:#.-]?\s*([0-9]{1,3}[A-Z]?|[0-9]XL|X{1,4}[SL]|S|M|L)\b/i
    ];

    for (const pattern of prefixPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // 2. Nhận diện size quần jeans / âu (Waist: W: 32 hoặc W32/L32)
    const waistMatch = cleanText.match(/(?:WAIST|W)\s*[:#.-]?\s*(2[4-9]|[3-4][0-9]|5[0-4])\b/);
    if (waistMatch && waistMatch[1]) {
      return waistMatch[1].trim();
    }

    // 3. Tìm ký hiệu size chữ phổ biến đứng độc lập (Loại trừ trường hợp L: 32 tức Length)
    const letterSizePattern = /\b(3XS|2XS|XXS|XS|S|M|L|XL|XXL|2XL|3XL|XXXL|4XL|XXXXL|FREE\s*SIZE|ONE\s*SIZE|OS)(?!\s*[:#]\s*\d+)\b/;
    const letterMatch = cleanText.match(letterSizePattern);
    if (letterMatch && letterMatch[1]) {
      return letterMatch[1].trim();
    }

    // 4. Tìm size dạng số (Ví dụ size quần: 26, 28, 29, 30, 31, 32, 34, 36) đi kèm từ khóa hoặc dòng riêng biệt
    const lines = cleanText.split(/[\r\n]+/);
    for (const line of lines) {
      const trimmed = line.trim();
      // Nếu 1 dòng chỉ có đúng 1 số từ 24 đến 54 (size quần/áo chuẩn số)
      if (/^\b(2[4-9]|[3-4][0-9]|5[0-4])\b$/.test(trimmed)) {
        return trimmed;
      }
      // Dạng số có tiền tố: Size 32
      const numMatch = trimmed.match(/(?:SIZE|SZ)\s*[:#.-]?\s*(2[4-9]|[3-4][0-9]|5[0-4])\b/);
      if (numMatch && numMatch[1]) {
        return numMatch[1];
      }
    }

    return null;
  }

  /**
   * Chuẩn hóa ký hiệu size để so sánh tương đương (ví dụ 2XL tương đương XXL)
   */
  public normalizeSize(rawSize: string | null): string | null {
    if (!rawSize) return null;

    let normalized = rawSize.trim().toUpperCase().replace(/\s+/g, "");

    const aliasMap: Record<string, string> = {
      "2XL": "XXL",
      "3XL": "XXXL",
      "4XL": "XXXXL",
      "5XL": "XXXXXL",
      "ONESIZE": "FREESIZE",
      "OS": "FREESIZE"
    };

    return aliasMap[normalized] || normalized;
  }

  /**
   * Kiểm tra toàn diện một sản phẩm với tập các tem được quét
   */
  public inspectGarment(input: GarmentInspectionInput): GarmentInspectionResult {
    const startTime = Date.now();
    const requiredLabels = input.requiredLabelTypes || this.defaultRequiredLabels;

    // 1. Phân tích từng tem: Bóc tách và chuẩn hóa size
    const inspectedLabels: InspectedLabel[] = input.labels.map((lbl) => {
      const detected = this.extractSize(lbl.rawText);
      const normalized = this.normalizeSize(detected);
      return {
        labelType: lbl.labelType,
        rawText: lbl.rawText,
        detectedSize: detected,
        normalizedSize: normalized,
        confidence: lbl.confidence ?? 100
      };
    });

    // 2. Kiểm tra tính đầy đủ của các loại tem bắt buộc
    const detectedTypes = new Set(inspectedLabels.map((l) => l.labelType));
    const missingTypes = requiredLabels.filter((req) => !detectedTypes.has(req));

    if (missingTypes.length > 0) {
      const missingNames = missingTypes.map((t) => this.getLabelDisplayName(t)).join(", ");
      return {
        status: "NG",
        isPass: false,
        matchedSize: null,
        reason: "MISSING_REQUIRED_LABEL",
        summaryMessage: `🔴 NG: Thiếu tem bắt buộc (${missingNames})`,
        detailedDiscrepancies: [`Thiếu các loại tem sau: ${missingNames}`],
        inspectedLabels,
        executionTimeMs: Date.now() - startTime,
        shouldAlarm: true
      };
    }

    // 3. Kiểm tra xem có tem nào không nhận diện được size không
    const labelsWithoutSize = inspectedLabels.filter((l) => !l.normalizedSize);
    if (labelsWithoutSize.length > 0) {
      const unreadNames = labelsWithoutSize
        .map((l) => this.getLabelDisplayName(l.labelType))
        .join(", ");
      return {
        status: "NG",
        isPass: false,
        matchedSize: null,
        reason: "SIZE_NOT_FOUND",
        summaryMessage: `🔴 NG: Không đọc được Size trên tem (${unreadNames})`,
        detailedDiscrepancies: [`Không nhận diện được kích cỡ trên: ${unreadNames}`],
        inspectedLabels,
        executionTimeMs: Date.now() - startTime,
        shouldAlarm: true
      };
    }

    // 4. So khớp Size giữa tất cả các tem
    const sizeGroups = new Map<string, InspectedLabel[]>();
    for (const lbl of inspectedLabels) {
      const sizeKey = lbl.normalizedSize!;
      const list = sizeGroups.get(sizeKey) || [];
      list.push(lbl);
      sizeGroups.set(sizeKey, list);
    }

    // Nếu chỉ có 1 kích cỡ duy nhất cho tất cả các tem -> PASS!
    if (sizeGroups.size === 1) {
      const commonSize = inspectedLabels[0].detectedSize || inspectedLabels[0].normalizedSize;
      return {
        status: "PASS",
        isPass: true,
        matchedSize: commonSize,
        summaryMessage: `🟢 PASS: Tất cả các tem đều đồng nhất Size [${commonSize}]`,
        inspectedLabels,
        executionTimeMs: Date.now() - startTime,
        shouldAlarm: false
      };
    }

    // Trường hợp có sự bất đồng bộ giữa các tem -> NG (LỆCH SIZE)
    const discrepancyDetails: string[] = inspectedLabels.map(
      (l) => `${this.getLabelDisplayName(l.labelType)}: Size [${l.detectedSize}]`
    );

    return {
      status: "NG",
      isPass: false,
      matchedSize: null,
      reason: "SIZE_MISMATCH",
      summaryMessage: `🔴 NG: Lệch Size giữa các tem! (${discrepancyDetails.join(" vs ")})`,
      detailedDiscrepancies: discrepancyDetails,
      inspectedLabels,
      executionTimeMs: Date.now() - startTime,
      shouldAlarm: true
    };
  }

  /**
   * Tên tiếng Việt thân thiện hiển thị cho công nhân
   */
  public getLabelDisplayName(type: GarmentLabelType): string {
    switch (type) {
      case "SIZE_LABEL":
        return "Tem Size (Cổ/Lưng)";
      case "CARE_LABEL":
        return "Tem Care (Sườn/Giặt)";
      case "HANG_TAG":
        return "Hang Tag (Thẻ treo)";
      case "PRICE_TAG":
        return "Tem Giá";
      default:
        return "Tem Phụ";
    }
  }
}

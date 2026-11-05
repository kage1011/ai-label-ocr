# AI Garment Multi-Label Size Inspection System

Hệ thống AI/Computer Vision chuyên dụng để tự động kiểm tra tính đồng nhất kích cỡ (**Size**) giữa các loại tem nhãn trên cùng một sản phẩm may mặc:
- **Size Label**: Tem size ở cổ áo / cạp quần
- **Care Label**: Tem sườn (hướng dẫn giặt / chăm sóc)
- **Hang Tag**: Thẻ bài / thẻ treo bằng giấy
- Và các loại tem phụ khác theo yêu cầu đơn hàng.

Mục tiêu cốt lõi: Đảm bảo **tất cả tem trên cùng 1 sản phẩm đều có cùng Size** trước khi gấp xếp đóng gói, thời gian kiểm tra tức thì (**< 200ms**, nhanh gấp 10 lần mục tiêu **< 2s**).

---

## 🎯 Quy tắc kiểm tra (PASS / NG)

- 🟢 **PASS**: Tất cả tem bắt buộc đều hiện diện và có **cùng kích cỡ** (ví dụ: Size: M, Care: M, Hang Tag: M) ➔ Kêu "Bíp" ngắn nhẹ, cho phép tiếp tục đóng gói.
- 🔴 **NG**: Phát hiện bất đồng bộ ➔ Phát còi cảnh báo ngay:
  - **Lệch kích cỡ (SIZE_MISMATCH)**: ví dụ Size: M, Care: M nhưng Hang Tag: L.
  - **Thiếu tem (MISSING_REQUIRED_LABEL)**: ví dụ thiếu tem Care hoặc quên bắn thẻ Hang Tag.
  - **Không đọc được size (SIZE_NOT_FOUND)**: tem bị gấp nếp, mờ, rách.

---

## 📁 Cấu trúc thư mục tinh gọn (Clean Architecture)

```text
ai-label-ocr/
├── src/
│   ├── config/
│   │   └── env.ts                               # Cấu hình biến môi trường
│   ├── domain/                                  # Tầng nghiệp vụ cốt lõi
│   │   ├── entities/
│   │   │   └── GarmentInspectionRecord.ts       # Bảng lưu lịch sử kiểm tra PASS/NG
│   │   └── value-objects/
│   │       └── GarmentInspection.ts             # Định nghĩa tem, trạng thái PASS/NG
│   ├── application/                             # Tầng xử lý nghiệp vụ
│   │   └── services/
│   │       └── garment-inspector.service.ts     # Trích xuất size, chuẩn hóa, so khớp đa tem
│   ├── infrastructure/                          # Tầng hạ tầng kỹ thuật
│   │   ├── database/
│   │   │   ├── typeorm-datasource.ts            # Kết nối Microsoft SQL Server
│   │   │   └── schema.sql                       # T-SQL tạo bảng GarmentInspectionRecords
│   │   └── ocr/
│   │       └── tesseract-ocr.service.ts         # OCR engine nhận dạng ký tự
│   ├── interfaces/                              # Tầng giao diện / Presentation
│   │   └── http/
│   │       ├── controllers/
│   │       │   ├── garment-inspection.controller.ts # Controller kiểm tra & lưu log
│   │       │   └── health.controller.ts             # Health check
│   │       ├── middlewares/
│   │       │   ├── upload.middleware.ts             # Upload ảnh tem
│   │       │   └── error.middleware.ts              # Global error handler
│   │       ├── routes/
│   │       │   ├── garment-inspection.routes.ts     # Route API kiểm tra
│   │       │   └── api.routes.ts                    # Router tổng
│   │       └── server.ts                            # Cấu hình Express Server
│   ├── scripts/
│   │   └── test-garment-inspection.ts               # Test suite 5 kịch bản thực tế & đo benchmark
│   └── index.ts                                 # Bootstrap & Dependency Injection
├── uploads/                                     # Thư mục lưu ảnh upload
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🏃‍♂️ Hướng dẫn chạy

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Chạy kiểm thử tự động (5 Kịch bản may mặc thực tế)
```bash
npm run test:garment
```

### 3. Khởi động Web API Server
```bash
# Chế độ phát triển (Auto-reload)
npm run dev

# Hoặc chế độ Production
npm run build
npm start
```

### 4. Danh sách API Endpoints
- **POST** `/api/v1/garment-inspections/validate`: Kiểm tra tức thì từ dữ liệu text JSON (phù hợp camera quét liên tục hoặc client gửi lên).
- **POST** `/api/v1/garment-inspections/scan-images`: Tải lên file ảnh của 3 loại tem (`sizeLabel`, `careLabel`, `hangTag`) để OCR và so sánh tự động.
- **GET** `/api/v1/garment-inspections/history`: Xem lịch sử kiểm tra các sản phẩm gần nhất (lưu trữ SQL Server).
- **GET** `/api/v1/health`: Kiểm tra trạng thái hệ thống.

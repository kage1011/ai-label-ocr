# AI Label OCR System (TypeScript + SQL Server + Archify)

Hệ thống AI OCR chuyên dụng để scan và trích xuất dữ liệu tự động từ tem nhãn sản phẩm / bao bì / logistics, xây dựng theo chuẩn **Clean Architecture** & **Repository Pattern**, sử dụng **TypeScript**, **TypeORM** kết nối **Microsoft SQL Server**, và tích hợp **Archify** để mô hình hóa và trực quan hóa kiến trúc hệ thống.

---

## 🚀 Tính năng nổi bật

1. **AI OCR & Smart Parser (Tesseract.js Engine)**:
   - Chạy nhận dạng văn bản cục bộ (Offline), không phụ thuộc vào API bên thứ 3.
   - Bộ parser thông minh tự động nhận diện và trích xuất các trường quan trọng từ nhãn:
     - **Barcode / SKU / UPC / Mã sản phẩm**
     - **Tên sản phẩm (Product Name)**
     - **Số Lô (Batch / Lot Number)**
     - **Số Seri (Serial Number / SN)**
     - **Ngày sản xuất (MFG Date)** & **Hạn sử dụng (EXP Date)**
     - **Xuất xứ (Country of Origin / Made In)**
     - **Khối lượng / Thể tích (Net Weight / Volume)**
     - **Metadata mở rộng (JSON)**

2. **Clean Architecture & Repository Pattern**:
   - Phân tầng độc lập: `Domain` -> `Application` -> `Infrastructure` -> `Interfaces (Presentation)`.
   - Toàn bộ thao tác truy vấn và chèn dữ liệu vào Microsoft SQL Server đều thông qua `ILabelRepository` và `IScanLogRepository`.

3. **Microsoft SQL Server & TypeORM**:
   - Tối ưu hóa cấu trúc bảng SQL Server với Index trên Barcode, BatchNumber, ProductName, CreatedAt.
   - Hỗ trợ auto-synchronize schema hoặc chạy script SQL thủ công (`src/infrastructure/database/schema.sql`).
   - Ghi nhận lịch sử audit log (thời gian xử lý ms, điểm tin cậy OCR, IP client, trạng thái scan).

4. **Tích hợp Archify**:
   - Định nghĩa Intermediate Representation (IR) tại `src/infrastructure/archify/archify.json`.
   - Sinh biểu đồ kiến trúc hệ thống trực quan tương tác tại `docs/architecture-diagram.html`.

---

## 📁 Cấu trúc thư mục dự án

```text
ai-label-ocr/
├── src/
│   ├── config/
│   │   └── env.ts                          # Quản lý biến môi trường
│   ├── domain/                             # Tầng Domain (Core Business)
│   │   ├── entities/
│   │   │   ├── Label.ts                    # Entity Tem nhãn (TypeORM)
│   │   │   └── ScanLog.ts                  # Entity Audit log quá trình scan
│   │   ├── repositories/
│   │   │   ├── ILabelRepository.ts         # Interface Repository quản lý Label
│   │   │   └── IScanLogRepository.ts       # Interface Repository quản lý Log
│   │   └── value-objects/
│   │       └── LabelParsedData.ts          # Struct dữ liệu nhãn sau parse
│   ├── infrastructure/                     # Tầng hạ tầng kỹ thuật
│   │   ├── database/
│   │   │   ├── typeorm-datasource.ts       # Kết nối Microsoft SQL Server
│   │   │   └── schema.sql                  # Script tạo bảng T-SQL cho SQL Server
│   │   ├── repositories/
│   │   │   ├── TypeORMLabelRepository.ts   # Triển khai ILabelRepository cho MSSQL
│   │   │   └── TypeORMScanLogRepository.ts # Triển khai IScanLogRepository cho MSSQL
│   │   ├── ocr/
│   │   │   ├── tesseract-ocr.service.ts    # OCR Worker Tesseract.js
│   │   │   └── label-parser.service.ts     # Bộ bóc tách trường dữ liệu tem nhãn
│   │   └── archify/
│   │       ├── archify.json                # Định dạng JSON-IR Archify
│   │       └── generate-diagram.ts         # Sinh HTML biểu đồ tương tác
│   ├── application/                        # Tầng nghiệp vụ ứng dụng
│   │   ├── dtos/
│   │   │   └── label.dto.ts                # DTOs & Zod schema validation
│   │   └── services/
│   │       └── label-scan.service.ts       # Điều phối OCR, parser và repository
│   ├── interfaces/                         # Tầng giao diện / Presentation
│   │   └── http/
│   │       ├── controllers/
│   │       │   ├── label.controller.ts     # Controller xử lý CRUD & Scan label
│   │       │   └── health.controller.ts    # Health check hệ thống & DB
│   │       ├── middlewares/
│   │       │   ├── upload.middleware.ts    # Multer upload ảnh nhãn
│   │       │   └── error.middleware.ts     # Global error handler
│   │       ├── routes/
│   │       │   ├── label.routes.ts         # Routes chi tiết cho /api/v1/labels
│   │       │   └── api.routes.ts           # Router tổng
│   │       └── server.ts                   # Cấu hình Express Server
│   ├── scripts/
│   │   ├── test-ocr.ts                     # Script test parser & OCR
│   │   └── seed.ts                         # Script chèn dữ liệu mẫu vào SQL Server
│   └── index.ts                            # Bootstrap & Dependency Injection
├── docs/
│   └── architecture-diagram.html           # Biểu đồ kiến trúc sinh từ Archify
├── .env.example                            # File cấu hình mẫu
├── ARCHITECTURE.md                         # Tài liệu chi tiết về kiến trúc
└── package.json
```

---

## ⚙️ Cài đặt & Cấu hình

### 1. Cấu hình biến môi trường (`.env`)
Chỉnh sửa file `.env` với thông tin kết nối Microsoft SQL Server của bạn:

```env
PORT=3000
NODE_ENV=development

# Cấu hình Microsoft SQL Server
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourStrongPassword123!
DB_DATABASE=LabelOcrDb
DB_SYNCHRONIZE=true
DB_LOGGING=false
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# Cấu hình OCR
OCR_LANG=eng
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10
```

### 2. Cài đặt dependencies
```bash
npm install
```

---

## 🏃‍♂️ Hướng dẫn chạy

### Chạy chế độ Development (Hot-reload)
```bash
npm run dev
```

### Build và chạy Production
```bash
npm run build
npm start
```

### Chạy kiểm thử OCR & Parser nhãn
```bash
# Test logic trích xuất mẫu
npm run test:ocr

# Hoặc test trực tiếp trên 1 ảnh nhãn thật
npm run test:ocr -- path/to/your-label.jpg
```

### Sinh sơ đồ kiến trúc hệ thống (Archify)
```bash
npm run archify:generate
```
Mở file `docs/architecture-diagram.html` trên trình duyệt để xem toàn bộ cấu trúc các tầng và luồng dữ liệu tương tác.

### Chèn dữ liệu mẫu vào SQL Server
```bash
npm run seed
```

---

## 📡 Danh sách REST API Endpoints

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| **POST** | `/api/v1/labels/scan` | Upload ảnh nhãn (field: `image`), OCR trích xuất thông tin và lưu tự động vào SQL Server |
| **GET** | `/api/v1/labels` | Lấy danh sách nhãn (phân trang, lọc theo barcode, batch, tên SP, ngày) |
| **GET** | `/api/v1/labels/:id` | Xem chi tiết 1 nhãn kèm scan logs |
| **GET** | `/api/v1/labels/barcode/:barcode` | Tìm kiếm nhãn theo mã vạch / SKU |
| **POST** | `/api/v1/labels` | Tạo mới bản ghi nhãn thủ công |
| **PUT** | `/api/v1/labels/:id` | Cập nhật nhãn (xác nhận trạng thái CONFIRMED/REJECTED, sửa thông tin) |
| **DELETE** | `/api/v1/labels/:id` | Xóa nhãn khỏi SQL Server |
| **GET** | `/api/v1/labels/logs/recent` | Xem lịch sử scan và thời gian phản hồi |
| **GET** | `/api/v1/health` | Kiểm tra tình trạng kết nối SQL Server và OCR Engine |

### Ví dụ gọi API Scan nhãn bằng cURL:
```bash
curl -X POST http://localhost:3000/api/v1/labels/scan \
  -F "image=@D:/sample_label.png"
```

Phản hồi mẫu (`HTTP 201`):
```json
{
  "success": true,
  "message": "Label scanned, processed, and stored into SQL Server successfully",
  "data": {
    "label": {
      "id": "e4b52cb1-6b45-429f-a2e6-76472f10b7cd",
      "barcode": "8934567890123",
      "productName": "Sữa Tươi Tiệt Trùng Ít Đường",
      "batchNumber": "VN-2026-B88",
      "serialNumber": "SN-774921",
      "manufactureDate": "2026-03-12",
      "expiryDate": "2026-09-12",
      "origin": "VIETNAM",
      "weightOrVolume": "250ml",
      "confidence": 95.8,
      "status": "DRAFT",
      "createdAt": "2026-11-04T16:20:00.000Z"
    },
    "extractedFields": {
      "barcode": "8934567890123",
      "batchNumber": "VN-2026-B88",
      "serialNumber": "SN-774921",
      "origin": "VIETNAM",
      "weightOrVolume": "250ml"
    },
    "scanLog": {
      "id": "18f9db56-...",
      "engine": "Tesseract.js",
      "durationMs": 760,
      "confidence": 95.8,
      "success": true
    }
  }
}
```

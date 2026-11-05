-- =============================================================
-- SQL Server Schema: Hệ thống kiểm tra tem may mặc (Garment Inspection)
-- =============================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'LabelOcrDb')
BEGIN
    CREATE DATABASE LabelOcrDb;
END
GO

USE LabelOcrDb;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GarmentInspectionRecords')
BEGIN
    CREATE TABLE GarmentInspectionRecords (
        id NVARCHAR(36) PRIMARY KEY,
        orderId NVARCHAR(100) NULL,
        garmentSku NVARCHAR(100) NULL,
        status NVARCHAR(10) NOT NULL, -- PASS | NG
        matchedSize NVARCHAR(50) NULL,
        failureReason NVARCHAR(50) NULL,
        summaryMessage NVARCHAR(MAX) NULL,
        labelsJson NVARCHAR(MAX) NULL,
        executionTimeMs INT NOT NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_GarmentInspection_Status ON GarmentInspectionRecords(status);
    CREATE INDEX IX_GarmentInspection_OrderId ON GarmentInspectionRecords(orderId);
    CREATE INDEX IX_GarmentInspection_Sku ON GarmentInspectionRecords(garmentSku);
    CREATE INDEX IX_GarmentInspection_CreatedAt ON GarmentInspectionRecords(createdAt);
END
GO

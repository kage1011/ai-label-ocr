-- ==============================================================
-- SQL Server Schema for AI Label OCR System
-- ==============================================================

-- 1. Create Database if not exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'LabelOcrDb')
BEGIN
    CREATE DATABASE LabelOcrDb;
END
GO

USE LabelOcrDb;
GO

-- 2. Create Labels Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Labels')
BEGIN
    CREATE TABLE Labels (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        barcode NVARCHAR(100) NULL,
        productName NVARCHAR(255) NULL,
        batchNumber NVARCHAR(100) NULL,
        serialNumber NVARCHAR(100) NULL,
        manufactureDate DATE NULL,
        expiryDate DATE NULL,
        origin NVARCHAR(150) NULL,
        weightOrVolume NVARCHAR(100) NULL,
        rawText NVARCHAR(MAX) NULL,
        confidence FLOAT NOT NULL DEFAULT 0,
        imagePath NVARCHAR(500) NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'DRAFT',
        metadata NVARCHAR(MAX) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    CREATE NONCLUSTERED INDEX IX_Labels_Barcode ON Labels (barcode);
    CREATE NONCLUSTERED INDEX IX_Labels_ProductName ON Labels (productName);
    CREATE NONCLUSTERED INDEX IX_Labels_BatchNumber ON Labels (batchNumber);
    CREATE NONCLUSTERED INDEX IX_Labels_CreatedAt ON Labels (createdAt DESC);
END
GO

-- 3. Create ScanLogs Audit Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ScanLogs')
BEGIN
    CREATE TABLE ScanLogs (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        labelId UNIQUEIDENTIFIER NULL,
        engine NVARCHAR(50) NOT NULL DEFAULT 'Tesseract.js',
        durationMs INT NOT NULL,
        confidence FLOAT NOT NULL DEFAULT 0,
        success BIT NOT NULL DEFAULT 1,
        errorMessage NVARCHAR(MAX) NULL,
        originalFileName NVARCHAR(500) NULL,
        clientIp NVARCHAR(100) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_ScanLogs_Labels FOREIGN KEY (labelId)
            REFERENCES Labels(id)
            ON DELETE SET NULL
    );

    CREATE NONCLUSTERED INDEX IX_ScanLogs_LabelId ON ScanLogs (labelId);
    CREATE NONCLUSTERED INDEX IX_ScanLogs_CreatedAt ON ScanLogs (createdAt DESC);
END
GO


import { AppDataSource, initializeDatabase } from "../infrastructure/database/typeorm-datasource.js";
import { Label, LabelStatus } from "../domain/entities/Label.js";
import { ScanLog } from "../domain/entities/ScanLog.js";

async function seed() {
  console.log("=== Seeding Initial Label Data into SQL Server ===");
  await initializeDatabase();

  const labelRepo = AppDataSource.getRepository(Label);
  const scanLogRepo = AppDataSource.getRepository(ScanLog);

  const sampleLabels: Partial<Label>[] = [
    {
      barcode: "8934567890123",
      productName: "Sữa Tươi Tiệt Trùng Ít Đường 100% 250ml",
      batchNumber: "VN-2026-B88",
      serialNumber: "SN-774921",
      manufactureDate: new Date("2026-03-12"),
      expiryDate: new Date("2026-09-12"),
      origin: "VIETNAM",
      weightOrVolume: "250ml",
      rawText: "PRODUCT: SUA TUOI TIET TRUNG IT DUONG\nBARCODE: 8934567890123\nLOT NO: VN-2026-B88\nEXP: 12/09/2026\nNET WEIGHT: 250ml",
      confidence: 96.5,
      status: LabelStatus.CONFIRMED,
      metadata: JSON.stringify({ category: "Dairy", organic: true })
    },
    {
      barcode: "8938501234567",
      productName: "Cà Phê Rang Xay Nguyên Chất Robusta",
      batchNumber: "LOT-CF-502",
      serialNumber: "SN-009124",
      manufactureDate: new Date("2026-01-10"),
      expiryDate: new Date("2027-01-10"),
      origin: "DAK LAK - VIETNAM",
      weightOrVolume: "500g",
      rawText: "CA PHE RANG XAY\nLOT: LOT-CF-502\nEXP: 10/01/2027\nWEIGHT: 500g\nMADE IN: VIETNAM",
      confidence: 98.2,
      status: LabelStatus.CONFIRMED,
      metadata: JSON.stringify({ roastLevel: "Medium Dark", grade: "A1" })
    }
  ];

  for (const item of sampleLabels) {
    const created = labelRepo.create(item);
    const saved = await labelRepo.save(created);
    console.log(`[Seed] Inserted Label: ${saved.productName} (ID: ${saved.id})`);

    const log = scanLogRepo.create({
      labelId: saved.id,
      engine: "Tesseract.js",
      durationMs: 820,
      confidence: saved.confidence,
      success: true,
      originalFileName: "sample_label.png"
    });
    await scanLogRepo.save(log);
  }

  console.log("=== Seeding Completed Successfully! ===");
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error("Seeding failed (Please check MSSQL connection):", err.message);
  process.exit(1);
});


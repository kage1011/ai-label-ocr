import { ScanLog } from "../entities/ScanLog.js";

export interface IScanLogRepository {
  create(logData: Partial<ScanLog>): Promise<ScanLog>;
  save(log: ScanLog): Promise<ScanLog>;
  findById(id: string): Promise<ScanLog | null>;
  findByLabelId(labelId: string): Promise<ScanLog[]>;
  getRecentLogs(limit?: number): Promise<ScanLog[]>;
  count(): Promise<number>;
}


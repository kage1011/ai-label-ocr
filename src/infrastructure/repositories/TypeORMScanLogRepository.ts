import { DataSource, Repository } from "typeorm";
import { ScanLog } from "../../domain/entities/ScanLog.js";
import { IScanLogRepository } from "../../domain/repositories/IScanLogRepository.js";

export class TypeORMScanLogRepository implements IScanLogRepository {
  constructor(private dataSource: DataSource) {}

  private get repo(): Repository<ScanLog> {
    return this.dataSource.getRepository(ScanLog);
  }

  async create(logData: Partial<ScanLog>): Promise<ScanLog> {
    return this.repo.create(logData);
  }

  async save(log: ScanLog): Promise<ScanLog> {
    return this.repo.save(log);
  }

  async findById(id: string): Promise<ScanLog | null> {
    return this.repo.findOne({
      where: { id },
      relations: { label: true }
    });
  }

  async findByLabelId(labelId: string): Promise<ScanLog[]> {
    return this.repo.find({
      where: { labelId },
      order: { createdAt: "DESC" }
    });
  }

  async getRecentLogs(limit: number = 20): Promise<ScanLog[]> {
    return this.repo.find({
      take: limit,
      order: { createdAt: "DESC" },
      relations: { label: true }
    });
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}


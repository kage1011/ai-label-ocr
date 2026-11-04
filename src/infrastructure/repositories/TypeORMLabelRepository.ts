import { DataSource, Repository, Between, Like, FindOptionsWhere } from "typeorm";
import { Label, LabelStatus } from "../../domain/entities/Label.js";
import {
  ILabelRepository,
  LabelFilterOptions,
  PaginatedResult
} from "../../domain/repositories/ILabelRepository.js";

export class TypeORMLabelRepository implements ILabelRepository {
  constructor(private dataSource: DataSource) {}

  private get repo(): Repository<Label> {
    return this.dataSource.getRepository(Label);
  }

  async create(labelData: Partial<Label>): Promise<Label> {
    return this.repo.create(labelData);
  }

  async save(label: Label): Promise<Label> {
    return this.repo.save(label);
  }

  async findById(id: string): Promise<Label | null> {
    return this.repo.findOne({
      where: { id },
      relations: { scanLogs: true }
    });
  }

  async findByBarcode(barcode: string): Promise<Label[]> {
    return this.repo.find({
      where: { barcode },
      order: { createdAt: "DESC" }
    });
  }

  async findByBatchNumber(batchNumber: string): Promise<Label[]> {
    return this.repo.find({
      where: { batchNumber },
      order: { createdAt: "DESC" }
    });
  }

  async findPaginated(options: LabelFilterOptions): Promise<PaginatedResult<Label>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Label> = {};

    if (options.barcode) {
      where.barcode = Like(`%${options.barcode}%`);
    }

    if (options.productName) {
      where.productName = Like(`%${options.productName}%`);
    }

    if (options.batchNumber) {
      where.batchNumber = Like(`%${options.batchNumber}%`);
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.startDate && options.endDate) {
      where.createdAt = Between(options.startDate, options.endDate);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: "DESC" }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async update(id: string, updateData: Partial<Label>): Promise<Label | null> {
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}


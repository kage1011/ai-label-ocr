import { Label, LabelStatus } from "../entities/Label.js";

export interface LabelFilterOptions {
  barcode?: string;
  productName?: string;
  batchNumber?: string;
  status?: LabelStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ILabelRepository {
  create(labelData: Partial<Label>): Promise<Label>;
  save(label: Label): Promise<Label>;
  findById(id: string): Promise<Label | null>;
  findByBarcode(barcode: string): Promise<Label[]>;
  findByBatchNumber(batchNumber: string): Promise<Label[]>;
  findPaginated(options: LabelFilterOptions): Promise<PaginatedResult<Label>>;
  update(id: string, updateData: Partial<Label>): Promise<Label | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}


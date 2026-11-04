import { z } from "zod";
import { LabelStatus } from "../../domain/entities/Label.js";

export const CreateLabelSchema = z.object({
  barcode: z.string().optional().nullable(),
  productName: z.string().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  manufactureDate: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
  expiryDate: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
  origin: z.string().optional().nullable(),
  weightOrVolume: z.string().optional().nullable(),
  rawText: z.string().optional().nullable(),
  confidence: z.number().min(0).max(100).optional(),
  status: z.nativeEnum(LabelStatus).optional(),
  metadata: z.record(z.any()).optional().nullable()
});

export const UpdateLabelSchema = CreateLabelSchema.partial();

export const QueryLabelSchema = z.object({
  barcode: z.string().optional(),
  productName: z.string().optional(),
  batchNumber: z.string().optional(),
  status: z.nativeEnum(LabelStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
});

export type CreateLabelDto = z.infer<typeof CreateLabelSchema>;
export type UpdateLabelDto = z.infer<typeof UpdateLabelSchema>;
export type QueryLabelDto = z.infer<typeof QueryLabelSchema>;


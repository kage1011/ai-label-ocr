import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index
} from "typeorm";
import { InspectionStatus, InspectionFailureReason } from "../value-objects/GarmentInspection.js";

@Entity({ name: "GarmentInspectionRecords" })
export class GarmentInspectionRecord {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "nvarchar", length: 100, nullable: true })
  orderId?: string | null;

  @Index()
  @Column({ type: "nvarchar", length: 100, nullable: true })
  garmentSku?: string | null;

  @Index()
  @Column({ type: "nvarchar", length: 10 })
  status!: InspectionStatus; // PASS | NG

  @Column({ type: "nvarchar", length: 50, nullable: true })
  matchedSize?: string | null;

  @Column({ type: "nvarchar", length: 50, nullable: true })
  failureReason?: InspectionFailureReason | null;

  @Column({ type: "nvarchar", length: "max", nullable: true })
  summaryMessage?: string | null;

  @Column({ type: "nvarchar", length: "max", nullable: true })
  labelsJson?: string | null;

  @Column({ type: "int" })
  executionTimeMs!: number;

  @CreateDateColumn()
  createdAt!: Date;
}


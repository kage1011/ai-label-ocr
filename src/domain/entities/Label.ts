import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from "typeorm";
import { ScanLog } from "./ScanLog.js";

export enum LabelStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED"
}

@Entity({ name: "Labels" })
export class Label {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "nvarchar", length: 100, nullable: true })
  barcode?: string | null;

  @Index()
  @Column({ type: "nvarchar", length: 255, nullable: true })
  productName?: string | null;

  @Column({ type: "nvarchar", length: 100, nullable: true })
  batchNumber?: string | null;

  @Column({ type: "nvarchar", length: 100, nullable: true })
  serialNumber?: string | null;

  @Column({ type: "date", nullable: true })
  manufactureDate?: Date | null;

  @Column({ type: "date", nullable: true })
  expiryDate?: Date | null;

  @Column({ type: "nvarchar", length: 150, nullable: true })
  origin?: string | null;

  @Column({ type: "nvarchar", length: 100, nullable: true })
  weightOrVolume?: string | null;

  @Column({ type: "nvarchar", length: "max", nullable: true })
  rawText?: string | null;

  @Column({ type: "float", default: 0 })
  confidence!: number;

  @Column({ type: "nvarchar", length: 500, nullable: true })
  imagePath?: string | null;

  @Column({
    type: "nvarchar",
    length: 20,
    default: LabelStatus.DRAFT
  })
  status!: LabelStatus;

  @Column({ type: "nvarchar", length: "max", nullable: true })
  metadata?: string | null;

  @CreateDateColumn({ type: "datetime2" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "datetime2" })
  updatedAt!: Date;

  @OneToMany(() => ScanLog, (log) => log.label, { cascade: true })
  scanLogs?: ScanLog[];
}


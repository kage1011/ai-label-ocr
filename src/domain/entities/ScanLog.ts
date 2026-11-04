import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from "typeorm";
import { Label } from "./Label.js";

@Entity({ name: "ScanLogs" })
export class ScanLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uniqueidentifier", nullable: true })
  labelId?: string | null;

  @ManyToOne(() => Label, (label) => label.scanLogs, {
    onDelete: "SET NULL",
    nullable: true
  })
  @JoinColumn({ name: "labelId" })
  label?: Label | null;

  @Column({ type: "nvarchar", length: 50, default: "Tesseract.js" })
  engine!: string;

  @Column({ type: "int" })
  durationMs!: number;

  @Column({ type: "float", default: 0 })
  confidence!: number;

  @Column({ type: "bit", default: true })
  success!: boolean;

  @Column({ type: "nvarchar", length: "max", nullable: true })
  errorMessage?: string | null;

  @Column({ type: "nvarchar", length: 500, nullable: true })
  originalFileName?: string | null;

  @Column({ type: "nvarchar", length: 100, nullable: true })
  clientIp?: string | null;

  @CreateDateColumn({ type: "datetime2" })
  createdAt!: Date;
}


import "reflect-metadata";
import { DataSource } from "typeorm";
import { ENV } from "../../config/env.js";
import { Label } from "../../domain/entities/Label.js";
import { ScanLog } from "../../domain/entities/ScanLog.js";

export const AppDataSource = new DataSource({
  type: "mssql",
  host: ENV.DB.HOST,
  port: ENV.DB.PORT,
  username: ENV.DB.USERNAME,
  password: ENV.DB.PASSWORD,
  database: ENV.DB.DATABASE,
  synchronize: ENV.DB.SYNCHRONIZE,
  logging: ENV.DB.LOGGING,
  entities: [Label, ScanLog],
  migrations: [],
  subscribers: [],
  options: {
    encrypt: ENV.DB.ENCRYPT,
    trustServerCertificate: ENV.DB.TRUST_SERVER_CERTIFICATE,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000
  }
});

export async function initializeDatabase(): Promise<DataSource> {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }
  try {
    console.log(`[Database] Connecting to Microsoft SQL Server at ${ENV.DB.HOST}:${ENV.DB.PORT}/${ENV.DB.DATABASE}...`);
    await AppDataSource.initialize();
    console.log("[Database] Connected successfully to Microsoft SQL Server!");
    return AppDataSource;
  } catch (error) {
    console.error("[Database] Failed to connect to Microsoft SQL Server:", error);
    throw error;
  }
}


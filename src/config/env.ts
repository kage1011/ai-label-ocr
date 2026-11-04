import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  DB: {
    HOST: process.env.DB_HOST || "localhost",
    PORT: parseInt(process.env.DB_PORT || "1433", 10),
    USERNAME: process.env.DB_USERNAME || "sa",
    PASSWORD: process.env.DB_PASSWORD || "YourStrongPassword123!",
    DATABASE: process.env.DB_DATABASE || "LabelOcrDb",
    SYNCHRONIZE: process.env.DB_SYNCHRONIZE === "true",
    LOGGING: process.env.DB_LOGGING === "true",
    ENCRYPT: process.env.DB_ENCRYPT === "true",
    TRUST_SERVER_CERTIFICATE: process.env.DB_TRUST_SERVER_CERTIFICATE !== "false"
  },

  OCR: {
    LANG: process.env.OCR_LANG || "eng",
    CACHE_DIR: path.resolve(process.cwd(), process.env.OCR_CACHE_DIR || "./.ocr-cache")
  },

  UPLOAD: {
    DIR: path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./uploads"),
    MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10)
  }
};


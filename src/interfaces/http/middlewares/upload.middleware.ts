import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { ENV } from "../../../config/env.js";

// Ensure upload directory exists
if (!fs.existsSync(ENV.UPLOAD.DIR)) {
  fs.mkdirSync(ENV.UPLOAD.DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, ENV.UPLOAD.DIR);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `label-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext) || file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Please upload a valid image.`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: ENV.UPLOAD.MAX_FILE_SIZE_MB * 1024 * 1024
  },
  fileFilter
});


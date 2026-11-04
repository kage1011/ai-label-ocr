import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("[Error Middleware]", err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.errors
    });
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {})
  });
}


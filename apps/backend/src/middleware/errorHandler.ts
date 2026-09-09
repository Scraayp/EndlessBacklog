import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ValidationError as SequelizeValidationError } from "sequelize";
import { AppError } from "../utils/AppError.js";
import { logger } from "../config/logger.js";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: { code: "NOT_FOUND", message: `No route for ${req.method} ${req.path}` } });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid request", details: err.flatten() },
    });
    return;
  }

  if (err instanceof SequelizeValidationError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid data",
        details: err.errors.map((e) => ({ path: e.path, message: e.message })),
      },
    });
    return;
  }

  logger.error({ err }, "unhandled error");
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
}

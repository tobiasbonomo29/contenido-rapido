import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";
import { failure } from "../utils/response";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (err instanceof ZodError) {
    return failure(res, "Validation error", err.errors, 422);
  }

  if (err instanceof AppError) {
    return failure(res, err.message, err.details, err.statusCode);
  }

  return failure(res, "Internal server error", undefined, 500);
}

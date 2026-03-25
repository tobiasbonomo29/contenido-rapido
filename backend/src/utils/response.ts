import { Response } from "express";

export function success(res: Response, message: string, data?: unknown) {
  return res.json({
    success: true,
    message,
    data
  });
}

export function failure(res: Response, message: string, errors?: unknown, status = 400) {
  return res.status(status).json({
    success: false,
    message,
    errors
  });
}

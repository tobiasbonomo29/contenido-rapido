import { Request, Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service";
import { success } from "../utils/response";

export const dashboardController = {
  async summary(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await dashboardService.summary();
      return success(res, "Dashboard summary fetched successfully", summary);
    } catch (error) {
      return next(error);
    }
  }
};

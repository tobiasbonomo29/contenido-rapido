import { Request, Response, NextFunction } from "express";
import { sourceService } from "../services/source.service";
import { success } from "../utils/response";

export const sourceController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const sources = await sourceService.list();
      return success(res, "Sources fetched successfully", sources);
    } catch (error) {
      return next(error);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const source = await sourceService.create(req.body);
      return success(res, "Source created successfully", source);
    } catch (error) {
      return next(error);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const source = await sourceService.update(req.params.id, req.body);
      return success(res, "Source updated successfully", source);
    } catch (error) {
      return next(error);
    }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await sourceService.delete(req.params.id);
      return success(res, "Source deleted successfully");
    } catch (error) {
      return next(error);
    }
  }
};

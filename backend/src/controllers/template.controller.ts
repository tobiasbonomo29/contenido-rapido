import { Request, Response, NextFunction } from "express";
import { templateService } from "../services/template.service";
import { success } from "../utils/response";

export const templateController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await templateService.list();
      return success(res, "Templates fetched successfully", templates);
    } catch (error) {
      return next(error);
    }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await templateService.getById(req.params.id);
      return success(res, "Template fetched successfully", template);
    } catch (error) {
      return next(error);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await templateService.create(req.body);
      return success(res, "Template created successfully", template);
    } catch (error) {
      return next(error);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await templateService.update(req.params.id, req.body);
      return success(res, "Template updated successfully", template);
    } catch (error) {
      return next(error);
    }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await templateService.delete(req.params.id);
      return success(res, "Template deleted successfully");
    } catch (error) {
      return next(error);
    }
  }
};

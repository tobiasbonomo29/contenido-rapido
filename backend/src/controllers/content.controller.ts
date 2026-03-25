import { Request, Response, NextFunction } from "express";
import { contentService } from "../services/content.service";
import { success } from "../utils/response";

export const contentController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, contentType, status, language } = req.query;
      const contents = await contentService.list({
        search: search as string | undefined,
        contentType: contentType as string | undefined,
        status: status as string | undefined,
        language: language as string | undefined
      });
      return success(res, "Content fetched successfully", contents);
    } catch (error) {
      return next(error);
    }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await contentService.getById(req.params.id);
      return success(res, "Content fetched successfully", content);
    } catch (error) {
      return next(error);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await contentService.create(req.body, req.user!.id);
      return success(res, "Content created successfully", content);
    } catch (error) {
      return next(error);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await contentService.update(req.params.id, req.body);
      return success(res, "Content updated successfully", content);
    } catch (error) {
      return next(error);
    }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await contentService.delete(req.params.id);
      return success(res, "Content deleted successfully");
    } catch (error) {
      return next(error);
    }
  },
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await contentService.updateStatus(req.params.id, req.body.status);
      return success(res, "Content status updated successfully", content);
    } catch (error) {
      return next(error);
    }
  },
  async duplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await contentService.duplicate(req.params.id);
      return success(res, "Content duplicated successfully", content);
    } catch (error) {
      return next(error);
    }
  }
};

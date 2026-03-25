import { Request, Response, NextFunction } from "express";
import { publicationService } from "../services/publication.service";
import { success } from "../utils/response";

export const publicationController = {
  async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { contentId, platform, scheduledAt } = req.body;
      const job = await publicationService.schedule(contentId, platform, scheduledAt);
      return success(res, "Publication scheduled successfully", job);
    } catch (error) {
      return next(error);
    }
  },
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await publicationService.list({
        contentId: typeof _req.query.contentId === "string" ? _req.query.contentId : undefined
      });
      return success(res, "Publications fetched successfully", jobs);
    } catch (error) {
      return next(error);
    }
  },
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await publicationService.cancel(req.params.id);
      return success(res, "Publication canceled successfully", job);
    } catch (error) {
      return next(error);
    }
  }
};

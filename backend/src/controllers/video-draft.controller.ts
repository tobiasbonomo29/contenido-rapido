import { NextFunction, Request, Response } from "express";
import { success } from "../utils/response";
import { videoDraftService } from "../services/video-draft.service";

export const videoDraftController = {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const draft = await videoDraftService.generate(req.params.contentId);
      return success(res, "Video draft generated successfully", draft);
    } catch (error) {
      return next(error);
    }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const draft = await videoDraftService.getById(req.params.id);
      return success(res, "Video draft fetched successfully", draft);
    } catch (error) {
      return next(error);
    }
  },
  async getByContent(req: Request, res: Response, next: NextFunction) {
    try {
      const drafts = await videoDraftService.getByContent(req.params.contentId);
      return success(res, "Video drafts fetched successfully", drafts);
    } catch (error) {
      return next(error);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const draft = await videoDraftService.update(req.params.id, req.body);
      return success(res, "Video draft updated successfully", draft);
    } catch (error) {
      return next(error);
    }
  },
  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const draft = await videoDraftService.approve(req.params.id);
      return success(res, "Video draft approved successfully", draft);
    } catch (error) {
      return next(error);
    }
  },
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const draft = await videoDraftService.updateStatus(req.params.id, req.body.status);
      return success(res, "Video draft status updated successfully", draft);
    } catch (error) {
      return next(error);
    }
  }
};

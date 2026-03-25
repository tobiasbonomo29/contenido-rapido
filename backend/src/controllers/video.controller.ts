import { Request, Response, NextFunction } from "express";
import { videoService } from "../services/video.service";
import { success } from "../utils/response";
import { AppError } from "../utils/errors";

export const videoController = {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const video = await videoService.generate(req.params.contentId);
      return success(res, "Video generation started", video);
    } catch (error) {
      return next(error);
    }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const video = await videoService.getById(req.params.id);
      if (!video) {
        throw new AppError("Video not found", 404);
      }
      return success(res, "Video fetched successfully", video);
    } catch (error) {
      return next(error);
    }
  },
  async getByContent(req: Request, res: Response, next: NextFunction) {
    try {
      const videos = await videoService.getByContent(req.params.contentId);
      return success(res, "Videos fetched successfully", videos);
    } catch (error) {
      return next(error);
    }
  }
};

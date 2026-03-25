import { Request, Response, NextFunction } from "express";
import { success } from "../utils/response";
import { AppError } from "../utils/errors";
import { uploadService } from "../services/upload.service";

export const uploadController = {
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError("File is required", 400);
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const imageUrl = uploadService.buildPublicUrl(baseUrl, req.file.filename);
      return success(res, "Image uploaded successfully", {
        imageUrl,
        fileName: req.file.filename
      });
    } catch (error) {
      return next(error);
    }
  }
};

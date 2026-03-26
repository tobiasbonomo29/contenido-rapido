import { NextFunction, Request, Response } from "express";
import { socialConnectionService } from "../services/social-connection.service";
import { success } from "../utils/response";

export const socialConnectionController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const connections = await socialConnectionService.list(
        req.user!.id,
        typeof req.query.platform === "string" ? (req.query.platform as "LINKEDIN" | "FACEBOOK") : undefined
      );

      return success(res, "Social connections fetched successfully", connections);
    } catch (error) {
      return next(error);
    }
  },
  async startOAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const result = socialConnectionService.startOAuth(req.user!.id, req.params.provider as "linkedin" | "facebook");
      return success(res, "OAuth start URL generated successfully", result);
    } catch (error) {
      return next(error);
    }
  },
  async callback(req: Request, res: Response, next: NextFunction) {
    try {
      const redirectUrl = await socialConnectionService.handleOAuthCallback(
        req.params.provider as "linkedin" | "facebook",
        {
          code: typeof req.query.code === "string" ? req.query.code : undefined,
          state: typeof req.query.state === "string" ? req.query.state : undefined,
          error: typeof req.query.error === "string" ? req.query.error : undefined,
          error_description: typeof req.query.error_description === "string" ? req.query.error_description : undefined
        }
      );

      return res.redirect(redirectUrl);
    } catch (error) {
      return next(error);
    }
  },
  async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      const connection = await socialConnectionService.disconnect(req.user!.id, req.params.id);
      return success(res, "Social connection disconnected successfully", connection);
    } catch (error) {
      return next(error);
    }
  }
};

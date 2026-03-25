import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { userRepo } from "../repositories/user.repo";
import { AppError } from "../utils/errors";
import { success } from "../utils/response";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return success(res, "Login successful", result);
    } catch (error) {
      return next(error);
    }
  },
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const user = await userRepo.findById(req.user.id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      return success(res, "User fetched successfully", {
        id: user.id,
        email: user.email,
        name: user.name
      });
    } catch (error) {
      return next(error);
    }
  }
};

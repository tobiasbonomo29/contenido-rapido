import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { videoDraftController } from "../controllers/video-draft.controller";
import {
  approveVideoDraftSchema,
  generateVideoDraftSchema,
  updateVideoDraftSchema,
  updateVideoDraftStatusSchema,
  videoDraftByIdSchema,
  videoDraftsByContentSchema
} from "../validators/video-draft.schema";

export const videoDraftRoutes = Router();

videoDraftRoutes.use(requireAuth);

videoDraftRoutes.post("/generate/:contentId", validate(generateVideoDraftSchema), videoDraftController.generate);
videoDraftRoutes.get("/content/:contentId", validate(videoDraftsByContentSchema), videoDraftController.getByContent);
videoDraftRoutes.get("/:id", validate(videoDraftByIdSchema), videoDraftController.getById);
videoDraftRoutes.patch("/:id", validate(updateVideoDraftSchema), videoDraftController.update);
videoDraftRoutes.patch("/:id/approve", validate(approveVideoDraftSchema), videoDraftController.approve);
videoDraftRoutes.patch("/:id/status", validate(updateVideoDraftStatusSchema), videoDraftController.updateStatus);

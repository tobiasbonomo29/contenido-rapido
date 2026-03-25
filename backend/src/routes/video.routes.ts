import { Router } from "express";
import { videoController } from "../controllers/video.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { generateVideoSchema } from "../validators/video.schema";

export const videoRoutes = Router();

videoRoutes.use(requireAuth);

videoRoutes.post("/generate/:contentId", validate(generateVideoSchema), videoController.generate);
videoRoutes.get("/:id", videoController.getById);
videoRoutes.get("/content/:contentId", videoController.getByContent);

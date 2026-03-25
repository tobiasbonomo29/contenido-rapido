import { Router } from "express";
import { contentController } from "../controllers/content.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createContentSchema, updateContentSchema, contentStatusSchema } from "../validators/content.schema";

export const contentRoutes = Router();

contentRoutes.use(requireAuth);

contentRoutes.get("/", contentController.list);
contentRoutes.get("/:id", contentController.getById);
contentRoutes.post("/", validate(createContentSchema), contentController.create);
contentRoutes.put("/:id", validate(updateContentSchema), contentController.update);
contentRoutes.delete("/:id", contentController.delete);
contentRoutes.patch("/:id/status", validate(contentStatusSchema), contentController.updateStatus);
contentRoutes.post("/:id/duplicate", contentController.duplicate);

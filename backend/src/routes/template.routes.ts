import { Router } from "express";
import { templateController } from "../controllers/template.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createTemplateSchema, updateTemplateSchema } from "../validators/template.schema";

export const templateRoutes = Router();

templateRoutes.use(requireAuth);

templateRoutes.get("/", templateController.list);
templateRoutes.get("/:id", templateController.getById);
templateRoutes.post("/", validate(createTemplateSchema), templateController.create);
templateRoutes.put("/:id", validate(updateTemplateSchema), templateController.update);
templateRoutes.delete("/:id", templateController.delete);

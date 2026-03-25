import { Router } from "express";
import { sourceController } from "../controllers/source.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createSourceSchema, updateSourceSchema } from "../validators/source.schema";

export const sourceRoutes = Router();

sourceRoutes.use(requireAuth);

sourceRoutes.get("/", sourceController.list);
sourceRoutes.post("/", validate(createSourceSchema), sourceController.create);
sourceRoutes.put("/:id", validate(updateSourceSchema), sourceController.update);
sourceRoutes.delete("/:id", sourceController.delete);

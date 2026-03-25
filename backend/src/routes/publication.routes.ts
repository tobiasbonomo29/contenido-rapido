import { Router } from "express";
import { publicationController } from "../controllers/publication.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { schedulePublicationSchema } from "../validators/publication.schema";

export const publicationRoutes = Router();

publicationRoutes.use(requireAuth);

publicationRoutes.post("/schedule", validate(schedulePublicationSchema), publicationController.schedule);
publicationRoutes.get("/", publicationController.list);
publicationRoutes.patch("/:id/cancel", publicationController.cancel);

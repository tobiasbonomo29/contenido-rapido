import { Router } from "express";
import { socialConnectionController } from "../controllers/social-connection.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  disconnectSocialConnectionSchema,
  listSocialConnectionsSchema,
  socialOAuthCallbackSchema,
  startSocialOAuthSchema
} from "../validators/social-connection.schema";

export const socialConnectionRoutes = Router();

socialConnectionRoutes.get("/oauth/:provider/callback", validate(socialOAuthCallbackSchema), socialConnectionController.callback);

socialConnectionRoutes.use(requireAuth);

socialConnectionRoutes.get("/", validate(listSocialConnectionsSchema), socialConnectionController.list);
socialConnectionRoutes.post("/oauth/:provider/start", validate(startSocialOAuthSchema), socialConnectionController.startOAuth);
socialConnectionRoutes.delete("/:id", validate(disconnectSocialConnectionSchema), socialConnectionController.disconnect);

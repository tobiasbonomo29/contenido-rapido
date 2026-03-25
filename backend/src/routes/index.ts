import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { contentRoutes } from "./content.routes";
import { templateRoutes } from "./template.routes";
import { sourceRoutes } from "./source.routes";
import { videoRoutes } from "./video.routes";
import { publicationRoutes } from "./publication.routes";
import { dashboardRoutes } from "./dashboard.routes";
import { uploadRoutes } from "./upload.routes";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/contents", contentRoutes);
routes.use("/templates", templateRoutes);
routes.use("/sources", sourceRoutes);
routes.use("/videos", videoRoutes);
routes.use("/publications", publicationRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/uploads", uploadRoutes);

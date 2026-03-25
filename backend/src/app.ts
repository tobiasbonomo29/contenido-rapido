import express from "express";
import cors from "cors";
import path from "path";
import { env } from "./config/env";
import { apiRateLimiter } from "./middlewares/rate-limit.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { routes } from "./routes";

export const app = express();

app.set("trust proxy", true);
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiRateLimiter);

app.use("/uploads", express.static(path.join(process.cwd(), env.uploadDir)));

app.use("/api", routes);

app.use(errorHandler);

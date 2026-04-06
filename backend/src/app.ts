import express from "express";
import cors from "cors";
import path from "path";
import { env } from "./config/env";
import { apiRateLimiter } from "./middlewares/rate-limit.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { routes } from "./routes";

export const app = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigin === "*") {
        return callback(null, true);
      }

      return callback(null, env.corsOrigin.includes(origin));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiRateLimiter);

app.use("/uploads", express.static(path.join(process.cwd(), env.uploadDir)));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api", routes);

app.use(errorHandler);

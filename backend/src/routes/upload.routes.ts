import { Router } from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../middlewares/auth.middleware";
import { uploadController } from "../controllers/upload.controller";
import { uploadService } from "../services/upload.service";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadService.getUploadDir());
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

export const uploadRoutes = Router();

uploadRoutes.use(requireAuth);

uploadRoutes.post("/image", upload.single("image"), uploadController.uploadImage);

import fs from "fs/promises";
import path from "path";
import { env } from "../config/env";

export const uploadService = {
  buildPublicPath(fileName: string) {
    return path.posix.join("/uploads", fileName);
  },
  buildPublicUrl(baseUrl: string, fileName: string) {
    return new URL(this.buildPublicPath(fileName), baseUrl).toString();
  },
  getUploadDir() {
    return path.join(process.cwd(), env.uploadDir);
  },
  getGeneratedVideoDir() {
    return path.join(this.getUploadDir(), "generated-videos");
  },
  async ensureGeneratedVideoDir() {
    await fs.mkdir(this.getGeneratedVideoDir(), { recursive: true });
  },
  buildGeneratedVideoPath(fileName: string) {
    return path.join(this.getGeneratedVideoDir(), fileName);
  },
  buildGeneratedVideoPublicPath(fileName: string) {
    return path.posix.join("/uploads/generated-videos", fileName);
  },
  buildGeneratedVideoPublicUrl(fileName: string) {
    return new URL(this.buildGeneratedVideoPublicPath(fileName), env.appBaseUrl).toString();
  },
  resolveLocalUploadPath(value?: string | null) {
    if (!value) {
      return null;
    }

    let uploadPath = value;

    try {
      uploadPath = new URL(value).pathname;
    } catch (_error) {
      uploadPath = value;
    }

    if (!uploadPath.startsWith("/uploads/")) {
      return null;
    }

    const relativePath = decodeURIComponent(uploadPath.slice("/uploads/".length));
    const uploadRoot = path.resolve(this.getUploadDir());
    const absolutePath = path.resolve(uploadRoot, relativePath);

    if (!absolutePath.startsWith(uploadRoot)) {
      return null;
    }

    return absolutePath;
  }
};

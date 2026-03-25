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
  }
};

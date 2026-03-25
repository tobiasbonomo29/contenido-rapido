import { prisma } from "../config/prisma";
import { dbCall } from "../utils/db";

export const userRepo = {
  findByEmail(email: string) {
    return dbCall(() => prisma.user.findUnique({ where: { email } }));
  },
  findById(id: string) {
    return dbCall(() => prisma.user.findUnique({ where: { id } }));
  }
};

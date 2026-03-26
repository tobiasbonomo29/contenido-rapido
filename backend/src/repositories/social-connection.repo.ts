import { Prisma, PublicationPlatform, SocialConnectionStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { dbCall } from "../utils/db";

export const socialConnectionRepo = {
  listByUser(userId: string, platform?: PublicationPlatform) {
    return dbCall(() =>
      prisma.socialConnection.findMany({
        where: {
          userId,
          ...(platform ? { platform } : {})
        },
        orderBy: [{ platform: "asc" }, { accountName: "asc" }]
      })
    );
  },
  getById(id: string) {
    return dbCall(() =>
      prisma.socialConnection.findUnique({
        where: { id }
      })
    );
  },
  getByIdForUser(id: string, userId: string) {
    return dbCall(() =>
      prisma.socialConnection.findFirst({
        where: {
          id,
          userId
        }
      })
    );
  },
  getFirstActiveByUserAndPlatform(userId: string, platform: PublicationPlatform) {
    return dbCall(() =>
      prisma.socialConnection.findFirst({
        where: {
          userId,
          platform,
          status: "ACTIVE"
        },
        orderBy: [{ updatedAt: "desc" }]
      })
    );
  },
  upsertByUserPlatformAccount(
    userId: string,
    platform: PublicationPlatform,
    accountId: string,
    data: Omit<Prisma.SocialConnectionUncheckedCreateInput, "userId" | "platform" | "accountId">
  ) {
    return dbCall(() =>
      prisma.socialConnection.upsert({
        where: {
          userId_platform_accountId: {
            userId,
            platform,
            accountId
          }
        },
        create: {
          userId,
          platform,
          accountId,
          ...data
        },
        update: data
      })
    );
  },
  update(id: string, data: Prisma.SocialConnectionUpdateInput) {
    return dbCall(() =>
      prisma.socialConnection.update({
        where: { id },
        data
      })
    );
  },
  markStatus(id: string, status: SocialConnectionStatus) {
    return dbCall(() =>
      prisma.socialConnection.update({
        where: { id },
        data: { status }
      })
    );
  }
};

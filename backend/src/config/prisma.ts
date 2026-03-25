import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | undefined;

function createPrismaClient() {
  return new PrismaClient();
}

export function getPrismaClient() {
  if (!prismaClient) {
    prismaClient = createPrismaClient();
  }

  return prismaClient;
}

export async function reconnectPrismaClient() {
  if (prismaClient) {
    await prismaClient.$disconnect().catch(() => undefined);
  }

  prismaClient = createPrismaClient();
  return prismaClient;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getPrismaClient(), property, receiver);
  }
});

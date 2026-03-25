import { Prisma } from "@prisma/client";
import { reconnectPrismaClient } from "../config/prisma";
import { AppError } from "./errors";

const transientPrismaCodes = new Set(["P1001", "P1002", "P1017"]);

function isTransientDatabaseError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return transientPrismaCodes.has(error.code);
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("can't reach database server") ||
    message.includes("timed out") ||
    message.includes("connection") && message.includes("closed") ||
    message.includes("socket hang up") ||
    message.includes("econnreset") ||
    message.includes("etimedout")
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function dbCall<T>(operation: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isTransientDatabaseError(error) || attempt === retries) {
        break;
      }

      await wait(400 * (attempt + 1));
      await reconnectPrismaClient().catch(() => undefined);
    }
  }

  if (isTransientDatabaseError(lastError)) {
    throw new AppError("Database temporarily unavailable. Retry in a few seconds.", 503);
  }

  throw lastError;
}

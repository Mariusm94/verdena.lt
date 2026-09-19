import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prismaClient?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaClient = prisma;

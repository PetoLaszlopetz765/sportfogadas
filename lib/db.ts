import { PrismaClient } from "@prisma/client";

// @ts-ignore
let globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Ha már létezik PrismaClient, ne hozzunk létre újat
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

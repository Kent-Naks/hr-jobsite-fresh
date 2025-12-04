// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Allow globalThis to hold the Prisma client during hot-reloads in dev
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// In development, attach to the global so HMR doesn't create new clients
if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

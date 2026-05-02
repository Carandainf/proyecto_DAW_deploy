import * as PrismaModule from "@prisma/client";
const { PrismaClient } = PrismaModule;
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Definimos el tipo correctamente para TypeScript
const globalForPrisma = globalThis as unknown as {
  prisma: typeof PrismaClient extends new () => infer T ? T : never;
};

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

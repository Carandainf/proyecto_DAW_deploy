import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Aseguramos que la cadena de conexión exista
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("La variable de entorno DATABASE_URL no está definida.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Gestión del singleton para el cliente de Prisma
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

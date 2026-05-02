import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // La URL se define aquí para el cliente y las migraciones
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

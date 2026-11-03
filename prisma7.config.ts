import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Configuración central de Prisma ORM para el proyecto.
 *
 * El CLI de Prisma (migraciones, db push) utiliza DIRECT_URL (puerto 5432 en Supabase)
 * para adquirir bloqueos de migración y ejecutar sentencias DDL. La aplicación web
 * en tiempo de ejecución continuará utilizando DATABASE_URL (modo transacción con pooler)
 * a través del adaptador en src/lib/prisma.ts.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL") || env("DATABASE_URL"),
  },
});

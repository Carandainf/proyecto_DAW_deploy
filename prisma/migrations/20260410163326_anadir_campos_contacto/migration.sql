/*
  Warnings:

  - You are about to drop the column `id_receptor` on the `mensajes` table. All the data in the column will be lost.
  - Added the required column `asunto` to the `contactos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_archivo` to the `mensajes` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_archivos" (
    "id_archivo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_usuario" TEXT NOT NULL,
    "nombre_archivo" TEXT NOT NULL,
    "url_path" TEXT NOT NULL DEFAULT '',
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "prioridad" TEXT NOT NULL DEFAULT 'normal',
    "descripcion" TEXT,
    "fecha_subida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_recepcion" DATETIME,
    CONSTRAINT "archivos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_archivos" ("estado", "fecha_recepcion", "fecha_subida", "id_archivo", "id_usuario", "nombre_archivo", "url_path") SELECT "estado", "fecha_recepcion", "fecha_subida", "id_archivo", "id_usuario", "nombre_archivo", "url_path" FROM "archivos";
DROP TABLE "archivos";
ALTER TABLE "new_archivos" RENAME TO "archivos";
CREATE TABLE "new_contactos" (
    "id_contacto" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "fecha_envio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_admin" TEXT,
    CONSTRAINT "contactos_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_contactos" ("email", "fecha_envio", "id_admin", "id_contacto", "mensaje", "nombre") SELECT "email", "fecha_envio", "id_admin", "id_contacto", "mensaje", "nombre" FROM "contactos";
DROP TABLE "contactos";
ALTER TABLE "new_contactos" RENAME TO "contactos";
CREATE TABLE "new_mensajes" (
    "id_mensaje" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_emisor" TEXT NOT NULL,
    "id_archivo" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha_envio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mensajes_id_emisor_fkey" FOREIGN KEY ("id_emisor") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mensajes_id_archivo_fkey" FOREIGN KEY ("id_archivo") REFERENCES "archivos" ("id_archivo") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_mensajes" ("contenido", "fecha_envio", "id_emisor", "id_mensaje") SELECT "contenido", "fecha_envio", "id_emisor", "id_mensaje" FROM "mensajes";
DROP TABLE "mensajes";
ALTER TABLE "new_mensajes" RENAME TO "mensajes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

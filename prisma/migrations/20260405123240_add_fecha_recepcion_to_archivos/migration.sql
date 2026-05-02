-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_archivos" (
    "id_archivo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_usuario" TEXT NOT NULL,
    "nombre_archivo" TEXT NOT NULL,
    "url_path" TEXT NOT NULL DEFAULT '',
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "fecha_subida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_recepcion" DATETIME,
    CONSTRAINT "archivos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_archivos" ("estado", "fecha_subida", "id_archivo", "id_usuario", "nombre_archivo") SELECT "estado", "fecha_subida", "id_archivo", "id_usuario", "nombre_archivo" FROM "archivos";
DROP TABLE "archivos";
ALTER TABLE "new_archivos" RENAME TO "archivos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

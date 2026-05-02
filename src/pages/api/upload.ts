import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * CONFIGURACIÓN DE SEGURIDAD PARA SUBIDAS
 * MAX_FILE_SIZE: 20MB (20 * 1024 * 1024 bytes)
 * MAX_FILES: 10 archivos por petición
 */
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_FILES = 10;

/**
 * @description Gestiona la subida masiva de archivos de diseño dental (.STL) con límites de seguridad.
 * * Flujo de trabajo:
 * 1. Valida la sesión del cliente (Seguridad de acceso).
 * 2. Controla cantidad y peso de los archivos (Seguridad de infraestructura).
 * 3. Valida extensiones .stl (Seguridad de tipos).
 * 4. Persistencia en disco y registro en base de datos.
 * * @param {Request} request - FormData con 'descripcion', 'prioridad' y array de 'files'.
 * @returns {Promise<Response>} 200 éxito, 400 error de validación, 401 no autorizado.
 */
export const POST: APIRoute = async ({ request }) => {
  // 1. Verificación de identidad mediante Better-Auth
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || !session.user) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }

  try {
    const formData = await request.formData();
    const descripcion = formData.get("descripcion") as string;
    const prioridad = formData.get("prioridad") as string;
    const files = formData.getAll("files") as File[];

    // 2. Validación de cantidad: Evitar ataques de saturación
    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: "No se enviaron archivos" }), { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return new Response(
        JSON.stringify({
          error: `No puedes subir más de ${MAX_FILES} archivos a la vez.`,
        }),
        { status: 400 }
      );
    }

    // 3. Validación técnica de formato y tamaño
    for (const file of files) {
      // Comprobación de extensión
      if (!file.name.toLowerCase().endsWith(".stl")) {
        return new Response(
          JSON.stringify({
            error: `El archivo ${file.name} no es un formato permitido (Solo .STL)`,
          }),
          { status: 400 }
        );
      }

      // Comprobación de peso: Evitar llenar el disco o saturar la RAM
      if (file.size > MAX_FILE_SIZE) {
        return new Response(
          JSON.stringify({
            error: `El archivo ${file.name} es demasiado grande. Máximo 20MB.`,
          }),
          { status: 400 }
        );
      }
    }

    // 4. Procesamiento y guardado (Ejecución solo si las validaciones previas pasaron)
    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);

      // Pasamos el archivo a buffer y lo escribimos en disco
      const arrayBuffer = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(arrayBuffer));

      // Registro lógico en la base de datos
      await prisma.archivo.create({
        data: {
          nombre_archivo: file.name,
          url_path: `/uploads/${fileName}`,
          id_usuario: session.user.id,
          estado: "pendiente",
          descripcion: descripcion || "",
          prioridad: prioridad || "normal",
        },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Archivos subidos y registrados con éxito",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error crítico en upload:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor al procesar la subida" }),
      { status: 500 }
    );
  }
};

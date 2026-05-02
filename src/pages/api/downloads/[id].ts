import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";
import { getUserRole } from "@/lib/auth";
import fs from "node:fs";
import path from "node:path";

/**
 * @description Endpoint de descarga segura de archivos.
 * Implementa una verificación de seguridad en varias capas:
 * 1. Autenticación: ¿El usuario ha iniciado sesión?
 * 2. Validación: ¿El ID proporcionado es válido?
 * 3. Existencia en DB: ¿El registro existe en la base de datos?
 * 4. Autorización: ¿El usuario es dueño o es Administrador?
 * 5. Integridad física: ¿El archivo existe realmente en el almacenamiento del servidor?
 * * @param {string} params.id - ID único del archivo (autoincremental en Prisma).
 * @returns {Promise<Response>} Stream de datos del archivo o JSON con error detallado.
 */
export const GET: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const { user, loggedIn, role } = await getUserRole(request);

  // 1. Verificación de seguridad básica (Autenticación)
  if (!loggedIn || !user) {
    return new Response(JSON.stringify({ error: "Sesión no válida o expirada" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Validación del parámetro ID
  if (!id || isNaN(parseInt(id))) {
    return new Response(JSON.stringify({ error: "El ID de archivo proporcionado no es válido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Buscar el registro en la base de datos
  const archivo = await prisma.archivo.findUnique({
    where: { id_archivo: parseInt(id) },
  });

  if (!archivo) {
    return new Response(
      JSON.stringify({ error: "El archivo no consta en nuestra base de datos" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // 4. Verificación de permisos (Autorización)
  // Un cliente solo puede bajar sus propios archivos. El admin puede bajarlos todos.
  if (archivo.id_usuario !== user.id && role !== "admin") {
    return new Response(
      JSON.stringify({ error: "Acceso denegado: No tienes permisos sobre este trabajo" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 5. Construir y validar la ruta física
  // Usamos path.resolve para asegurar que la ruta sea absoluta y correcta según el OS
  const filePath = path.join(process.cwd(), "public", archivo.url_path);

  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      // Devuelvo un HTML en lugar de JSON para que sea algo más bonito
      const htmlError = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Archivo no disponible</title>
          <style>
            body { font-family: system-ui, sans-serif; background-color: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; }
            .box { background: #1e293b; padding: 40px; border-radius: 16px; border: 1px solid #334155; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
            h1 { color: #06b6d4; font-size: 24px; margin-top: 0; text-transform: uppercase; }
            p { color: #94a3b8; font-size: 16px; line-height: 1.5; margin-bottom: 24px; }
            button { background: #06b6d4; color: #020617; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; text-transform: uppercase; font-size: 12px; }
            button:hover { background: #fff; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>Archivo no disponible</h1>
            <p>El archivo físico que intentas descargar no se encuentra en el servidor. Por favor, ponte en contacto con el administrador mediante el chat del trabajo para solucionarlo.</p>
            <button onclick="history.back()">Volver atrás</button>
          </div>
        </body>
        </html>
      `;

      return new Response(htmlError, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  } catch (e) {
    return new Response("Error interno del servidor", { status: 500 });
  }

  // 6. Servir el archivo mediante un Stream (Eficiencia en memoria)
  // En lugar de leer todo el buffer, abrimos un flujo de lectura
  try {
    const stream = fs.createReadStream(filePath);

    // Convertimos el stream de Node en un ReadableStream compatible con el estándar de Response de Astro
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      },
    });

    return new Response(webStream, {
      status: 200,
      headers: {
        // 'application/sla' es el MIME type oficial para archivos STL,
        // pero 'application/octet-stream' asegura que el navegador lo descargue en lugar de intentar abrirlo.
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${archivo.nombre_archivo}"`,
        "Content-Length": fs.statSync(filePath).size.toString(), // Informamos del tamaño para la barra de progreso del navegador
      },
    });
  } catch (error) {
    console.error("Fallo crítico en el proceso de descarga:", error);
    return new Response(JSON.stringify({ error: "Error interno al procesar la descarga" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";
import { getUserRole } from "@/lib/auth";

export const GET: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const { user, loggedIn, role } = await getUserRole(request);

  if (!loggedIn || !user) {
    return new Response(JSON.stringify({ error: "Sesión no válida" }), { status: 401 });
  }

  const archivo = await prisma.archivo.findUnique({
    where: { id_archivo: parseInt(id!) },
  });

  if (!archivo) {
    return new Response(JSON.stringify({ error: "Archivo no encontrado" }), { status: 404 });
  }

  // Validación de permisos (dueño o admin)
  if (archivo.id_usuario !== user.id && role !== "admin") {
    return new Response(JSON.stringify({ error: "Acceso denegado" }), { status: 403 });
  }

  try {
    let finalUrl = archivo.url_path;

    // Reparación automática de la URL ---
    // Si la ruta es puramente local (ej. "/uploads/archivo.stl"), fallamos.
    if (finalUrl.startsWith("/")) {
      console.error("Intento de acceder a un archivo local en Vercel:", finalUrl);
      throw new Error("ARCHIVO_LOCAL_NO_SOPORTADO");
    }

    // Si la URL viene de Cloudinary pero le falta el https://, se lo añadimos
    if (!finalUrl.startsWith("http")) {
      finalUrl = `https://${finalUrl}`;
    }

    // Usamos new URL() para asegurar que los caracteres como nuestra querida "ñ" se procesen bien
    const safeUrl = new URL(finalUrl).href;
    // ----------------------------------------------------

    const responseCloudinary = await fetch(safeUrl);

    if (!responseCloudinary.ok) {
      throw new Error("CLOUDINARY_ERROR");
    }

    // Buffer en lugar de streaming directo para evitar cortes en Vercel
    const arrayBuffer = await responseCloudinary.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${archivo.nombre_archivo}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("DEBUG_ERROR_DOWNLOAD:", error.message);

    // HTML indicando que no encuentra el archivo
    const htmlError = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Archivo no disponible</title>
        <style>
          body { font-family: system-ui, sans-serif; background-color: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .box { background: #1e293b; padding: 40px; border-radius: 16px; border: 1px solid #334155; max-width: 500px; }
          h1 { color: #06b6d4; }
          p { color: #94a3b8; margin-bottom: 24px; }
          button { background: #06b6d4; color: #020617; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>Archivo no disponible</h1>
          <p>Este archivo se subió antes de configurar la nube o no se encuentra disponible actualmente.</p>
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
};

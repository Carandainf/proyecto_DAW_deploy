import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";
import { getUserRole } from "@/lib/auth";

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
    return new Response(JSON.stringify({ error: "El ID de archivo no es válido" }), {
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
  if (archivo.id_usuario !== user.id && role !== "admin") {
    return new Response(
      JSON.stringify({ error: "Acceso denegado: No tienes permisos sobre este trabajo" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 5. Obtener el archivo desde Cloudinary
  try {
    // Intentamos conectar con la URL de la nube guardada en la DB
    const responseCloudinary = await fetch(archivo.url_path);

    if (!responseCloudinary.ok) {
      // Si Cloudinary devuelve un error, mostramos tu HTML personalizado
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
            <p>El archivo físico en la nube no se encuentra disponible. Por favor, ponte en contacto con el laboratorio para que vuelvan a subir el diseño.</p>
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

    // 6. Servir el archivo al cliente
    // Reutilizamos el stream que viene de Cloudinary hacia el navegador
    return new Response(responseCloudinary.body, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${archivo.nombre_archivo}"`,
        // Intentamos pasar el tamaño si Cloudinary nos lo da
        "Content-Length": responseCloudinary.headers.get("Content-Length") || "",
      },
    });
  } catch (error) {
    console.error("Fallo crítico en el proceso de descarga remota:", error);
    return new Response(
      JSON.stringify({ error: "Error de conexión con el almacenamiento en la nube" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

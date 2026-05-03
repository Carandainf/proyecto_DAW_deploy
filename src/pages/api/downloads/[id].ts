// src/pages/api/downloads/[id].ts
export const prerender = false;

import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const GET: APIRoute = async ({ params, request }) => {
  console.log("API DOWNLOAD HIT", params.id);

  try {
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    }

    // sesión (forma correcta en SSR/Vercel)
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      console.log("NO SESSION");
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }

    const user = session.user;

    const archivo = await prisma.archivo.findUnique({
      where: { id_archivo: id },
    });

    if (!archivo) {
      console.log("ARCHIVO NO EXISTE");
      return new Response(JSON.stringify({ error: "Archivo no encontrado" }), { status: 404 });
    }

    // permisos
    if (archivo.id_usuario !== user.id && user.role !== "admin") {
      console.log("FORBIDDEN", user.id, archivo.id_usuario);
      return new Response(JSON.stringify({ error: "Acceso denegado" }), { status: 403 });
    }

    let finalUrl = archivo.url_path;

    console.log("URL ORIGINAL:", finalUrl);

    // archivos locales no válidos en Vercel
    if (finalUrl.startsWith("/")) {
      throw new Error("ARCHIVO_LOCAL_NO_SOPORTADO");
    }

    // asegurar protocolo
    if (!finalUrl.startsWith("http")) {
      finalUrl = `https://${finalUrl}`;
    }

    let finalSafeUrl = finalUrl;

    // fuerza descarga correctamente en Cloudinary
    if (finalSafeUrl.includes("/raw/upload/")) {
      const parts = finalSafeUrl.split("/raw/upload/");
      finalSafeUrl = `${parts[0]}/raw/upload/fl_attachment:${encodeURIComponent(
        archivo.nombre_archivo || "archivo.stl"
      )}/${parts[1]}`;
    }

    return new Response(null, {
      status: 307,
      headers: {
        Location: finalSafeUrl,
      },
    });
  } catch (error: any) {
    console.error("DOWNLOAD ERROR:", error.message);

    const htmlError = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Archivo no disponible</title>
      <style>
        body {
          font-family: system-ui, sans-serif;
          background-color: #0f172a;
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          text-align: center;
        }
        .box {
          background: #1e293b;
          padding: 40px;
          border-radius: 16px;
          border: 1px solid #334155;
          max-width: 500px;
        }
        h1 { color: #06b6d4; }
        p { color: #94a3b8; margin-bottom: 24px; }
        button {
          background: #06b6d4;
          color: #020617;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>Archivo no disponible</h1>
        <p>Este archivo no existe o no está disponible actualmente.</p>
        <button onclick="history.back()">Volver atrás</button>
      </div>
    </body>
    </html>
  `;

    return new Response(htmlError, {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
};

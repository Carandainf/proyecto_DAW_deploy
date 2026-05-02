import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * @description Procesa la baja administrativa de un cliente con verificación de seguridad.
 * En lugar de eliminar el registro físicamente (Hard Delete), realiza un "Soft Delete"
 * marcando al usuario como 'banned'.
 * * Seguridad: Solo accesible por usuarios con rol "admin".
 * * @param {Request} request - Objeto de petición que contiene el 'id' del usuario en formato JSON.
 * @returns {Promise<Response>} 200 si fue exitoso, 401 si no está autorizado, 500 error interno.
 */
export const POST: APIRoute = async ({ request }) => {
  // 1. Verificamos la sesión y el rol de administrador
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }

  try {
    const { id } = await request.json();

    // 2. Ejecutamos el borrado lógico
    await prisma.user.update({
      where: { id },
      data: {
        banned: true,
        banReason: "Baja administrativa. Datos conservados por trazabilidad legal.",
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error en proceso de baja:", error);
    return new Response(JSON.stringify({ error: "No se pudo procesar la baja" }), { status: 500 });
  }
};

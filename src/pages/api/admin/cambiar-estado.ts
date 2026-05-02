import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * @description Actualiza el estado de un trabajo/archivo dental (ej: de 'Pendiente' a 'En Proceso').
 * * Seguridad: Requiere sesión de administrador para evitar cambios de estado no autorizados.
 * * @param {Request} request - Contiene 'id' (id_archivo) y el nuevo 'estado'.
 * @returns {Promise<Response>} 200 éxito, 401 no autorizado, 500 error de base de datos.
 */
export const POST: APIRoute = async ({ request }) => {
  // Verificación de seguridad añadida
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }

  try {
    const { id, estado } = await request.json();

    await prisma.archivo.update({
      where: { id_archivo: Number(id) },
      data: { estado: estado },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error al cambiar el estado" }), { status: 500 });
  }
};

import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * @description Actualiza la información de perfil de un cliente existente.
 * * @param {Request} request - Contiene 'id', 'name' y 'email'.
 * @returns {Promise<Response>} 200 éxito, 400 datos inválidos o duplicados, 500 error de DB.
 */
export const POST: APIRoute = async ({ request }) => {
  // Protección de ruta a nivel API
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }

  try {
    const { id, name, email } = await request.json();

    // Validación básica de campos requeridos
    if (!id || !name || !email) {
      return new Response(JSON.stringify({ error: "Todos los campos son obligatorios" }), {
        status: 400,
      });
    }

    // Actualizamos el usuario en la base de datos
    await prisma.user.update({
      where: { id },
      data: {
        name: name,
        email: email,
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    // Manejo específico para violación de unicidad (Email duplicado)
    if (error.code === "P2002") {
      return new Response(JSON.stringify({ error: "El email ya está en uso por otro cliente" }), {
        status: 400,
      });
    }

    console.error("Error al actualizar cliente:", error);
    return new Response(JSON.stringify({ error: "No se pudo actualizar el cliente" }), {
      status: 500,
    });
  }
};

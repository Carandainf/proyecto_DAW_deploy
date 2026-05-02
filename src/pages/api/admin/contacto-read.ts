import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * @description Marca un mensaje del formulario de contacto como leído.
 * * Registra automáticamente qué administrador realizó la acción y en qué fecha para auditoría interna.
 * * @param {Request} request - Contiene el 'id_contacto'.
 * @returns {Promise<Response>} 200 éxito, 400 falta ID, 401 no autorizado, 500 error interno.
 */
export const POST: APIRoute = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || session.user.role !== "admin") {
    return new Response(
      JSON.stringify({ error: "No autorizado. Se requiere perfil de administrador." }),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id_contacto } = body;

    if (!id_contacto) {
      return new Response(JSON.stringify({ error: "ID de contacto no proporcionado" }), {
        status: 400,
      });
    }

    await prisma.contacto.update({
      where: { id_contacto: Number(id_contacto) },
      data: {
        leido: true,
        id_admin: session.user.id,
        fecha_gestion: new Date(),
      },
    });

    return new Response(JSON.stringify({ message: "Contacto marcado como leído correctamente" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error en contacto-read:", error);
    return new Response(JSON.stringify({ error: "Error interno al procesar la solicitud" }), {
      status: 500,
    });
  }
};

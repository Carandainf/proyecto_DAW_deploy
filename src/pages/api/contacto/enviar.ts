import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";

/**
 * @description Procesa la recepción de mensajes del formulario de contacto público.
 * Crea un registro en la tabla 'contacto' para que luego pueda ser gestionado desde el panel de admin.
 * * Nota: Este endpoint no requiere autenticación ya que es la puerta de entrada para nuevos clientes.
 * * @param {Request} request - Contiene 'nombre', 'email', 'asunto' y 'mensaje'.
 * @returns {Promise<Response>} 200 éxito, 500 error de base de datos.
 */
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  try {
    await prisma.contacto.create({
      data: {
        nombre: body.nombre,
        email: body.email,
        asunto: body.asunto,
        mensaje: body.mensaje,
        leido: false, // El mensaje entra en estado pendiente (no leído)
      },
    });
    return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
  } catch (error) {
    console.error("Error al guardar contacto:", error);
    return new Response(JSON.stringify({ error: "Error BD" }), { status: 500 });
  }
};

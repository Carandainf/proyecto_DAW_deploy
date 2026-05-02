import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";
import { getUserRole } from "@/lib/auth";

/**
 * @description Registra un nuevo mensaje en el chat/comunicación interna de un archivo específico.
 * * Este endpoint es híbrido: permite que tanto el admin como el cliente envíen mensajes.
 * * @param {Request} request - Contiene 'id_archivo' y el 'contenido' del mensaje.
 * @returns {Promise<Response>} 200 éxito, 401 no autorizado, 500 error de base de datos.
 */
export const POST: APIRoute = async ({ request }) => {
  const { user } = await getUserRole(request);

  if (!user) return new Response("No autorizado", { status: 401 });

  try {
    const { id_archivo, contenido } = await request.json();

    await prisma.mensaje.create({
      data: {
        id_archivo: Number(id_archivo),
        id_emisor: user.id,
        contenido: contenido.toString(),
        fecha_envio: new Date(),
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "No se pudo enviar el mensaje" }), { status: 500 });
  }
};

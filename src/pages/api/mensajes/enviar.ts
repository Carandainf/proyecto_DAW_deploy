import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";
import { getUserRole } from "@/lib/auth";

/**
 * @description Procesa el envío de mensajes en el chat de un trabajo.
 * A diferencia de otros endpoints, este maneja 'formData' para permitir redirecciones
 * directas desde formularios estándar de HTML.
 * * @param {Request} request - Objeto que contiene 'contenido' (texto) e 'id_archivo' (contexto del chat).
 * @returns {Promise<Response>} Redirección a la vista del trabajo o error 401/400/500.
 */
export const POST: APIRoute = async ({ request, redirect }) => {
  const { user, loggedIn } = await getUserRole(request);

  // 1. Protección de seguridad básica: El usuario debe estar autenticado
  if (!loggedIn || !user) {
    return new Response("No autorizado", { status: 401 });
  }

  // 2. Extracción y validación de datos del formulario (FormData)
  const formData = await request.formData();
  const contenido = formData.get("contenido")?.toString();
  const id_archivo = formData.get("id_archivo")?.toString();

  if (!contenido || !id_archivo) {
    return new Response("Faltan datos obligatorios", { status: 400 });
  }

  try {
    // 3. Persistencia del mensaje en la base de datos
    await prisma.mensaje.create({
      data: {
        contenido: contenido,
        id_archivo: parseInt(id_archivo),
        id_emisor: user.id, // Vinculamos el mensaje al usuario de la sesión
      },
    });

    // 4. Experiencia de usuario: Redirigimos de vuelta para mostrar el mensaje actualizado
    return redirect(`/dashboard/cliente/trabajo/${id_archivo}`);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return new Response("Error interno al guardar el mensaje", { status: 500 });
  }
};

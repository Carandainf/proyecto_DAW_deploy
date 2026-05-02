import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import nodemailer from "nodemailer";

/**
 * @description Gestiona el envío de respuestas por email a las consultas de contacto.
 * * El proceso incluye:
 * 1. Validación de administrador.
 * 2. Recuperación de los datos del contacto original.
 * 3. Envío de correo mediante el servidor SMTP configurado.
 * 4. Actualización del registro en la DB marcándolo como gestionado.
 * * @param {Request} request - Contiene 'id_contacto' y el texto de la 'respuesta'.
 * @returns {Promise<Response>} 200 éxito, 404 no encontrado, 500 error de envío o DB.
 */
export const POST: APIRoute = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }

  try {
    const { id_contacto, respuesta } = await request.json();

    const contacto = await prisma.contacto.findUnique({
      where: { id_contacto: Number(id_contacto) },
    });

    if (!contacto) return new Response(JSON.stringify({ error: "No encontrado" }), { status: 404 });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Laboratorio Dental" <${process.env.SMTP_USER}>`,
      to: contacto.email,
      subject: `RE: ${contacto.asunto}`,
      text: respuesta,
      html: `<p>Hola ${contacto.nombre},</p><p>${respuesta}</p>`,
    });

    await prisma.contacto.update({
      where: { id_contacto: contacto.id_contacto },
      data: {
        leido: true,
        id_admin: session.user.id,
        fecha_gestion: new Date(),
      },
    });

    return new Response(JSON.stringify({ message: "Respuesta enviada con éxito" }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error al enviar el correo" }), { status: 500 });
  }
};

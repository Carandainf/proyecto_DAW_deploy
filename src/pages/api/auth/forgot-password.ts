import type { APIRoute } from "astro";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * @description Inicia el flujo de recuperación de contraseña (Olvidé mi contraseña).
 * * Implementa "Privacy by Design": si el email no existe, responde con éxito igualmente
 * para evitar el "Email Enumeration" (impedir que atacantes sepan quién tiene cuenta).
 * * @param {Request} request - Contiene el 'email' del usuario.
 * @returns {Promise<Response>} Siempre devuelve 200 por seguridad, a menos que haya un error de servidor (500).
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    // 1. Verificación de seguridad: ¿Existe el usuario en nuestra base de datos?
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // No revelamos que el email no existe. El usuario real recibirá el correo,
      // el atacante no sabrá si ha tenido éxito o no.
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // 2. Si el usuario existe, Better-Auth genera el token único y dispara
    // el transporte SMTP (nodemailer) configurado en el servidor.
    // @ts-ignore - Ignoramos validación de tipos por integración dinámica de Better-Auth 1.5
    await auth.api.requestPasswordReset({
      body: {
        email: email,
        redirectTo: "/reset-password",
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), { status: 500 });
  }
};

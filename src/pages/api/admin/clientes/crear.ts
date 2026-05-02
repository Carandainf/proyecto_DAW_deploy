import type { APIRoute } from "astro";
import { auth } from "@/lib/auth";
import crypto from "crypto"; // Importamos para la seguridad de la contraseña

/**
 * @description Crea un nuevo cliente en el sistema y dispara el flujo de activación.
 * * El proceso consta de:
 * 1. Validación de privilegios de Administrador.
 * 2. Registro del usuario en la base de datos de autenticación.
 * 3. Envío automático de un enlace de 'Reset Password' para que el cliente configure su acceso.
 * * @param {Request} request - Contiene 'name', 'email' y una 'password' generado automáticamente.
 * @returns {Promise<Response>} 200 éxito, 401 no autorizado, 500 error de registro.
 */
export const POST: APIRoute = async ({ request }) => {
  // 1. Verificación de sesión de administrador
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }

  try {
    // Ya NO recibimos 'password' del frontend, el Admin no debe inventarla
    const { name, email } = await request.json();

    // 2. GENERAR CONTRASEÑA IMPOSIBLE
    // Generamos 32 bytes aleatorios convertidos a hexadecimal (64 caracteres)
    const impossiblePassword = crypto.randomBytes(32).toString("hex");

    // 3. Crear el usuario en la base de datos con la clave aleatoria
    await auth.api.signUpEmail({
      body: {
        email,
        password: impossiblePassword, // Inyectamos la clave generada
        name,
        role: "user",
      },
    });

    // 4. Disparar el proceso de recuperación/configuración
    // El cliente recibirá el email y DEBE crear su propia contraseña para entrar
    await auth.api.requestPasswordReset({
      body: {
        email: email,
        redirectTo: "/reset-password",
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error("Error detallado:", error);

    const message = error.message?.includes("already exists")
      ? "El email ya está registrado"
      : "Error al crear el cliente";

    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};

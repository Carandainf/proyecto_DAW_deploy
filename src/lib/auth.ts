import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import nodemailer from "nodemailer";

/**
 * @description Configuración central de Better-Auth (Lado Servidor).
 * Gestiona la persistencia, flujos de seguridad y notificaciones.
 */
export const auth = betterAuth({
  // Adaptador para conectar Better-Auth con nuestra base de datos vía Prisma
  database: prismaAdapter(prisma, { provider: "sqlite" }),

  emailAndPassword: {
    enabled: true,
    /**
     * @description Hook personalizado para enviar correos de recuperación/activación.
     * Genera un correo estilizado con los colores corporativos (dark mode).
     */
    sendResetPassword: async ({ user, url }) => {
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
        to: user.email,
        subject: "Configura tu acceso - Laboratorio Dental",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: white; padding: 40px; border-radius: 20px; border: 1px solid #1e293b;">
            <h2 style="color: #00f2ff; font-style: italic; font-size: 24px;">¡Bienvenido, Dr/a. ${user.name}!</h2>
            <p style="color: #94a3b8; line-height: 1.6;">Se ha creado su cuenta para el portal de gestión. Por motivos de seguridad, debe configurar su contraseña personal haciendo clic en el botón inferior.</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${url}" style="display: inline-block; background-color: #00f2ff; color: #0f172a; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">
                Configurar mi Contraseña
              </a>
            </div>
            
            <p style="font-size: 11px; color: #475569; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px;">
              Este enlace es de un solo uso y caducará en 1 hora. Si el enlace expira, contacte con soporte.
            </p>
          </div>
        `,
      });
    },
  },

  // Extensión del esquema de usuario para incluir roles (admin/user)
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: true,
      },
    },
  },

  // Sesión configurada para durar 1 semana
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },

  secret: process.env.BETTER_AUTH_SECRET!,
  baseUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:4321",
});

/**
 * @description Helper para obtener el rol y los datos del usuario desde cualquier petición.
 * @param {Request} request
 * @returns Objeto con loggedIn (boolean), role y user.
 */
export async function getUserRole(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || !session.user) {
    return { loggedIn: false, role: null, user: null };
  }

  return {
    loggedIn: true,
    role: session.user.role || "user",
    user: session.user,
  };
}

/**
 * @description Middleware de protección de rutas para Astro.
 * Verifica si el usuario está autenticado y si posee el rol necesario.
 * @param {Request} request
 * @param {string} requiredRole - Opcional. 'admin' o 'user'.
 * @returns Objeto con instrucciones de redirección si no cumple los requisitos.
 */
export async function protectRoute(request: Request, requiredRole?: string) {
  const { loggedIn, role, user } = await getUserRole(request);

  if (!loggedIn) {
    return { shouldRedirect: true, url: "/", user: null };
  }

  // Si requiere un rol específico y el usuario no lo tiene, redirigir a su dashboard correspondiente
  if (requiredRole && role !== requiredRole) {
    const fallback = role === "admin" ? "/dashboard/admin" : "/dashboard/cliente";
    return { shouldRedirect: true, url: fallback, user };
  }

  return { shouldRedirect: false, user, role };
}

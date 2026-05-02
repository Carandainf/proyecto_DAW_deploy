import { createAuthClient } from "better-auth/react";

/**
 * @description Cliente de autenticación para el Frontend (React/Astro).
 * Configura la base del SDK para realizar peticiones de identidad.
 */
export const authClient = createAuthClient({
  // Prioriza la URL de producción (Vercel/Cloudflare) definida en variables de entorno
  baseURL: import.meta.env.PUBLIC_BETTER_AUTH_URL ?? "http://localhost:4321",
});

/**
 * @description Métodos exportados para facilitar el acceso a la lógica de sesión.
 * - signUp: Registro de usuarios.
 * - signIn: Inicio de sesión.
 * - signOut: Cierre de sesión.
 * - useSession: Hook de React para obtener el estado del usuario en tiempo real.
 * - resetPassword: Inicia el flujo de recuperación de contraseña.
 */
export const { signUp, signIn, signOut, useSession, resetPassword } = authClient;

import { auth } from "@/lib/auth";
import type { APIRoute } from "astro";

export const prerender = false;

/**
 * @description Handler universal de autenticación (Better-Auth).
 * Este endpoint captura todas las peticiones dirigidas a /api/auth/* * (login, logout, callback, session, etc.) y las delega al motor de auth.
 * * @param {Request} request - Petición entrante desde el cliente o servidor.
 * @returns {Promise<Response>} Respuesta procesada por Better-Auth.
 */
export const ALL: APIRoute = async ({ request }) => {
  // Log de depuración para monitorear intentos de acceso y flujos de auth
  console.log("Petición recibida en auth handler:", request.url);
  return await auth.handler(request);
};

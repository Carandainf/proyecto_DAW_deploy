// src/pages/api/auth/reset-password/[token].ts
export const prerender = false;

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const token = params.token;

    // token inválido → muestr HTML
    if (!token) {
      return new Response(htmlError(), {
        status: 400,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    // redirect correcto
    const redirectUrl = new URL("/reset-password", request.url);
    redirectUrl.searchParams.set("token", token);

    return Response.redirect(redirectUrl.toString(), 302);
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return new Response(htmlError(), {
      status: 500,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }
};

// 🔥 HTML para mostrar el error de token erróneo por pantalla
function htmlError() {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Enlace inválido</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        background-color: #0f172a;
        color: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        text-align: center;
      }
      .box {
        background: #1e293b;
        padding: 40px;
        border-radius: 16px;
        border: 1px solid #334155;
        max-width: 500px;
      }
      h1 { color: #06b6d4; }
      p { color: #94a3b8; margin-bottom: 24px; }
      button {
        background: #06b6d4;
        color: #020617;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <h1>Enlace inválido</h1>
      <p>El enlace de recuperación no es válido o ha expirado.</p>
      <button onclick="history.back()">Volver atrás</button>
    </div>
  </body>
  </html>
  `;
}

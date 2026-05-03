import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless"; // O 'serverless'

export default defineConfig({
  output: "server",
  adapter: vercel({
    // A veces esto es necesario
    webAnalytics: { enabled: false },
  }),
  security: {
    checkOrigin: false, // Desactiva la comprobación estricta que esta chocando con Vercel
  },
});
